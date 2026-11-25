// AI Teacher: the lessons. Pure text logic, no drawing (the classroom is js/core/teacher.js, the player is js/core/tutor.js).
//
// teacherTopicLesson(info)  -> scenes for one topic (tool) of a tab: greeting, why, formula, how it fits the tab, a worked example on the
//                              student's OWN numbers (when some are typed in the tool), a "who can tell me" check question, a wrap-up.
// teacherTabLesson(info)    -> scenes that introduce a whole tab (module) and tour its topics.
//   info = { moduleKey, tabName, toolId, title, formula, desc, nums, topics }   (all plain text / numbers read from the page)
//
// A scene: { id, title, line, say?, ms, board: [chalk lines], pose, look, student? }
//   board  the lines chalked up in this scene (the first is the heading, written in yellow)
//   pose   what the teacher's body does: greet | explain | write | point | count | ask
//   look   where she looks: 'board' | 'class'
// Every number the teacher speaks is computed from the student's data here, never canned, so the voice always agrees with the tool.

const TEACHER_TABS = {
    descriptive: {
        name: 'Descriptive Statistics',
        goal: 'Descriptive statistics squeeze a long list of numbers into a few figures you can say out loud: where the middle is, and how spread out the values are.',
        steps: ['1. Look at the data: how many values?', '2. Find the centre (mean, median, mode)', '3. Measure the spread (range, SD, IQR)', '4. Check the shape (skew, outliers)'],
        say: 'First look at the data and count the values. Then find the centre. Then measure the spread. And finally check the shape, for example skewness and outliers.',
        tip: 'Always report a centre together with a spread. A mean on its own can hide a lot.'
    },
    manipulation: {
        name: 'Data Preparation',
        goal: 'Before we analyse data we clean it and reshape it, so that the numbers are comparable and one wild value does not fool us.',
        steps: ['1. Plot it: histogram or box plot', '2. Spot outliers (IQR rule, z-score)', '3. Transform: z-score, log, normalise', '4. Plot again and compare'],
        say: 'First plot your data. Then spot the outliers. Then transform the values, for example with a z-score or a log. And finally plot again and compare with the start.',
        tip: 'Never delete a value just because it is awkward. Find out why it is unusual first.'
    },
    probability: {
        name: 'Probability Distributions',
        goal: 'A probability distribution tells us how likely each value is. It is the model that sits behind every statistical test.',
        steps: ['1. Pick the distribution and its parameters', '2. PDF / PMF: how likely is each value?', '3. CDF: P(X ≤ x), the area to the left', '4. Quantile: the value for a chosen probability'],
        say: 'First pick the distribution and its parameters. The density tells us how likely each value is. The C D F gives the area to the left of a value. And the quantile goes the other way, from a probability back to a value.',
        tip: 'The total area under a density curve is always exactly 1. Probability is area, not height.'
    },
    correlation: {
        name: 'Correlation & Association',
        goal: 'Correlation measures how strongly two variables move together. It never says that one causes the other.',
        steps: ['1. Draw the scatter plot first', '2. Choose the measure (Pearson, Spearman, ...)', '3. Read the size and the sign', '4. Remember: correlation is not causation'],
        say: 'First draw the scatter plot. Then choose the right measure for your kind of data. Read both the size and the sign. And always remember that correlation is not causation.',
        tip: 'A correlation near zero only rules out a straight-line relationship, not every relationship.'
    },
    hypothesis: {
        name: 'Hypothesis Testing',
        goal: 'A hypothesis test asks one question: could a result this extreme happen by chance alone, if nothing special were going on?',
        steps: ['1. State H₀ (nothing going on) and H₁', '2. Choose the significance level α', '3. Compute the test statistic and the p-value', '4. p < α: reject H₀, otherwise do not'],
        say: 'Step one: state the null hypothesis and the alternative. Step two: choose the significance level alpha. Step three: compute the test statistic and the p-value. Step four: if p is smaller than alpha we reject the null hypothesis, otherwise we do not.',
        tip: 'Failing to reject H₀ does not prove H₀ true. It only says we did not find enough evidence against it.'
    },
    regression: {
        name: 'Regression & Models',
        goal: 'Regression draws the best line through the data, so we can describe the relationship and predict new values.',
        steps: ['1. Plot y against x', '2. Fit the least-squares line', '3. Judge the fit: R², F, p-values', '4. Check the residuals before trusting it'],
        say: 'First plot y against x. Then fit the least squares line. Judge the fit with R squared and the p-values. And always check the residuals before you trust the model.',
        tip: 'A high R² does not make a model correct. Look at the residual plot.'
    }
};

// What to watch for, per topic (id = the tool's route name). Topics without an entry get the tab's tip.
const TEACHER_TOPIC_NOTES = {
    mean: { use: 'the balance point of the values', watch: 'One very large value drags the mean towards it, so check for outliers.' },
    median: { use: 'the middle value once the data are sorted', watch: 'The median ignores how extreme the ends are, so it is the safer centre for skewed data.' },
    mode: { use: 'the most frequent value', watch: 'A data set can have no mode, or several.' },
    geometric: { use: 'the average growth factor, for rates and ratios', watch: 'Every value must be positive.' },
    harmonic: { use: 'the right average for rates such as speed', watch: 'Every value must be positive, and zero is not allowed.' },
    variance: { use: 'the average squared distance from the mean', watch: 'For a sample we divide by n minus 1, not n.' },
    stddev: { use: 'a typical distance from the mean, in the original units', watch: 'It is the square root of the variance, so it is sensitive to outliers.' },
    range: { use: 'the distance from the smallest to the largest value', watch: 'It uses only two values, so one outlier changes it completely.' },
    iqr: { use: 'the spread of the middle half of the data', watch: 'It is resistant to outliers, unlike the range.' },
    quartiles: { use: 'the three cut points that split sorted data in four equal parts', watch: 'Different software uses slightly different quartile rules.' },
    percentiles: { use: 'the value below which a chosen percentage of the data falls', watch: 'The 50th percentile is the median.' },
    cv: { use: 'spread relative to the mean, so different units can be compared', watch: 'It breaks down when the mean is close to zero.' },
    skewness: { use: 'which side the long tail is on', watch: 'Positive skew means a long right tail.' },
    kurtosis: { use: 'how heavy the tails are', watch: 'High kurtosis means more extreme values than a normal curve.' },
    stderror: { use: 'how much the sample mean would wobble from sample to sample', watch: 'It shrinks as n grows, but only like one over the square root of n.' },
    fivenum: { use: 'the five numbers behind a box plot', watch: 'Minimum, Q1, median, Q3 and maximum together describe centre, spread and shape.' },
    zscore: { use: 'how many standard deviations a value sits from the mean', watch: 'A z-score beyond 2 or 3 in size is unusual.' },
    normalize: { use: 'squeezing values onto a common scale', watch: 'Min-max scaling is badly affected by outliers.' },
    boxplot: { use: 'seeing the centre, spread and outliers in one picture', watch: 'The box is the middle half of the data, and the whiskers stop at the fences.' },
    histogram: { use: 'the shape of the distribution', watch: 'The bin width changes how the picture looks, so try more than one.' },
    iqroutlier: { use: 'flagging values beyond 1.5 times the IQR from the box', watch: 'A flagged value is a question to investigate, not an automatic deletion.' },
    zoutlier: { use: 'flagging values with a very large z-score', watch: 'Outliers inflate the SD, which can hide themselves.' },
    pdf: { use: 'how likely values are around each point', watch: 'For a continuous variable the height is a density, not a probability.' },
    cdf: { use: 'the probability of being at or below a value', watch: 'It only ever goes up, from 0 to 1.' },
    quantile: { use: 'the value that has a chosen probability below it', watch: 'It is the inverse of the CDF.' },
    pearson: { use: 'the strength of a straight-line relationship, from minus 1 to plus 1', watch: 'It is sensitive to outliers and only sees straight lines.' },
    spearman: { use: 'a correlation of ranks, so any steadily rising or falling relationship counts', watch: 'It is the safer choice for skewed data or outliers.' },
    kendall: { use: 'a rank correlation based on pairs that agree or disagree', watch: 'It suits small samples with many ties.' },
    covariance: { use: 'whether two variables rise and fall together', watch: 'Its size depends on the units, so use correlation to compare.' },
    chisquare: { use: 'whether two categorical variables are related', watch: 'Expected counts should not be too small.' },
    onesamplet: { use: 'whether a mean differs from a target value', watch: 'It assumes roughly normal data, or a reasonable sample size.' },
    twosamplet: { use: 'whether two group means differ', watch: 'Check whether the two spreads are similar. Welch’s version does not need that.' },
    pairedt: { use: 'whether before and after measurements on the same subjects differ', watch: 'Test the differences, not the two columns separately.' },
    anova: { use: 'whether three or more group means differ', watch: 'A significant ANOVA tells you something differs, not which group. Follow up with Tukey.' },
    ftest: { use: 'whether two variances are equal', watch: 'It is sensitive to non-normal data.' },
    mannwhitney: { use: 'comparing two groups without assuming normality', watch: 'It compares ranks, so it is really about the whole distribution.' },
    wilcoxon: { use: 'the paired comparison when normality is doubtful', watch: 'It uses the size ranks of the differences.' },
    kruskalwallis: { use: 'the rank-based alternative to one-way ANOVA', watch: 'A significant result does not say which groups differ.' },
    tukeyhsd: { use: 'which pairs of groups differ after an ANOVA', watch: 'It controls the overall error rate across all pairs.' },
    shapirowilk: { use: 'testing whether data look normal', watch: 'With big samples it flags tiny, harmless departures, so also look at a Q-Q plot.' },
    onesamplez: { use: 'whether a mean differs from a target when the population SD is known', watch: 'The population standard deviation must really be known.' },
    oneproportionz: { use: 'whether a proportion differs from a target', watch: 'You need enough successes and failures, roughly ten of each.' },
    binomialexact: { use: 'an exact test for a proportion in small samples', watch: 'It uses the binomial distribution itself, so no approximation is needed.' },
    levene: { use: 'whether group variances are equal', watch: 'It is less sensitive to non-normality than Bartlett’s test.' },
    bartlett: { use: 'whether group variances are equal', watch: 'It assumes the data are normal.' },
    mcnemar: { use: 'paired yes or no results, such as before and after', watch: 'Only the pairs that changed carry information.' },
    signTest: { use: 'whether the median differs, using only plus and minus signs', watch: 'It is simple and robust, but it throws away the sizes.' },
    simplelinear: { use: 'the best straight line through the points', watch: 'Check the residuals, and do not predict far outside your data.' },
    multiplelinear: { use: 'predicting y from several x variables at once', watch: 'Predictors that are strongly correlated with each other make the coefficients unstable.' },
    modelsummary: { use: 'judging the whole regression at a glance', watch: 'R squared always rises when you add a variable, so use the adjusted version to compare.' },
    vif: { use: 'detecting predictors that overlap', watch: 'A VIF above about 5 to 10 is a warning sign.' },
    durbinwatson: { use: 'checking whether residuals are correlated one after the other', watch: 'A value near 2 is good; near 0 or 4 is trouble.' },
    cooksdistance: { use: 'finding observations that pull the regression line', watch: 'A large Cook’s distance means one point has too much influence.' },
    fitdistribution: { use: 'finding which distribution describes your data', watch: 'Compare the fit with a plot, not only a number.' }
};

const teacherClean = s => String(s == null ? '' : s).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}️📌]/gu, '').replace(/\s+/g, ' ').trim();
const teacherNum = v => { const x = +(+v).toPrecision(5); return String(Math.abs(x) >= 1e6 || (x !== 0 && Math.abs(x) < 1e-4) ? x.toExponential(3) : x); };

// What the teacher does with the student's own numbers: the topic's own statistic when it is simple, otherwise a short summary.
function teacherDataSummary(nums, toolId) {
    const x = (nums || []).filter(Number.isFinite), n = x.length;
    if (n < 2) return null;
    const sorted = x.slice().sort((a, b) => a - b), sum = x.reduce((a, b) => a + b, 0), mean = sum / n;
    const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    const ss = x.reduce((a, b) => a + (b - mean) * (b - mean), 0), variance = ss / (n - 1), sd = Math.sqrt(variance);
    const counts = new Map(); x.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
    const top = Math.max(...counts.values()), modes = [...counts].filter(([, c]) => c === top).map(([v]) => v);
    const positive = x.every(v => v > 0);
    const own = {
        mean: () => ({ name: 'mean', val: mean, how: `${teacherNum(sum)} divided by ${n}` }),
        median: () => ({ name: 'median', val: median, how: 'the middle of the sorted values' }),
        mode: () => (top > 1 ? { name: 'mode', val: modes[0], how: `it appears ${top} times` } : null),
        range: () => ({ name: 'range', val: sorted[n - 1] - sorted[0], how: `${teacherNum(sorted[n - 1])} minus ${teacherNum(sorted[0])}` }),
        variance: () => ({ name: 'sample variance', val: variance, how: `the squared distances, ${teacherNum(ss)}, divided by ${n - 1}` }),
        stddev: () => ({ name: 'standard deviation', val: sd, how: 'the square root of the variance' }),
        sumsquares: () => ({ name: 'sum of squares', val: ss, how: 'the squared distances from the mean, added up' }),
        stderror: () => ({ name: 'standard error', val: sd / Math.sqrt(n), how: `the standard deviation divided by the square root of ${n}` }),
        cv: () => (mean !== 0 ? { name: 'coefficient of variation', val: sd / Math.abs(mean) * 100, how: 'the SD as a percentage of the mean', unit: ' percent' } : null),
        geometric: () => (positive ? { name: 'geometric mean', val: Math.exp(x.reduce((a, b) => a + Math.log(b), 0) / n), how: 'the n-th root of the product' } : null),
        harmonic: () => (positive ? { name: 'harmonic mean', val: n / x.reduce((a, b) => a + 1 / b, 0), how: 'n divided by the sum of reciprocals' } : null)
    };
    const topic = own[toolId] ? own[toolId]() : null;
    return { n, min: sorted[0], max: sorted[n - 1], mean, median, sd, topic };
}

function teacherTopicLesson(info) {
    const tab = TEACHER_TABS[info.moduleKey] || TEACHER_TABS.descriptive;
    const title = teacherClean(info.title) || 'this topic';
    const formula = teacherClean(info.formula);
    const desc = teacherClean(info.desc);
    const note = TEACHER_TOPIC_NOTES[info.toolId] || null;
    const d = teacherDataSummary(info.nums, info.toolId);
    const scenes = [];

    scenes.push({ id: 'hello', title: 'Welcome', ms: 2600, pose: 'greet', look: 'class',
        board: [title, tab.name],
        line: `Good morning, class! Today, in ${tab.name}, our topic is: ${title}.` });

    scenes.push({ id: 'why', title: 'Why we need it', ms: 3200, pose: 'explain', look: 'class',
        board: [title, note ? 'Use it for: ' + note.use : 'What it tells us:', ...(desc ? [desc] : [])].filter(Boolean),
        line: note ? `We use ${title} to find ${note.use}. ${desc}` : `Here is what ${title} tells us. ${desc}`, });

    if (formula) {
        scenes.push({ id: 'formula', title: 'The formula', ms: 3000, pose: 'write', look: 'board',
            board: [title, 'Formula:', formula],
            line: `Watch the board. Here is the formula: ${formula}`,
            say: `Watch the board. Here is the formula: ${formula}` });
    }

    scenes.push({ id: 'method', title: `How it fits ${tab.name}`, ms: 3600, pose: 'point', look: 'board',
        board: [tab.name, ...tab.steps],
        line: `Where does it fit? ${tab.say}` });

    if (d) {
        const lines = [`Your data: n = ${d.n}`, `smallest ${teacherNum(d.min)}, largest ${teacherNum(d.max)}`];
        let say = `Now let us use your own numbers. You gave me ${d.n} values, from ${teacherNum(d.min)} up to ${teacherNum(d.max)}. Their mean is ${teacherNum(d.mean)} and their standard deviation is ${teacherNum(d.sd)}.`;
        if (d.topic) {
            const t = d.topic, unit = t.unit || '';
            lines.push(`${t.name} = ${teacherNum(t.val)}${unit ? ' %' : ''}`);
            say += ` For this topic, the ${t.name} is ${teacherNum(t.val)}${unit}: that is ${t.how}.`;
        } else { lines.push(`mean = ${teacherNum(d.mean)}`, `SD = ${teacherNum(d.sd)}`); }
        scenes.push({ id: 'data', title: 'Your own numbers', ms: 3800, pose: 'count', look: 'board', board: ['Your numbers', ...lines], line: say });
    } else {
        scenes.push({ id: 'data', title: 'Your own numbers', ms: 2800, pose: 'count', look: 'class',
            board: ['Your numbers', 'Type them in the box below', 'Then press Calculate'],
            line: 'Now it is your turn. Type your own numbers into the box below this class, then press Calculate. I will work through them with you, and the full step by step solution appears on the page.' });
    }

    scenes.push({ id: 'ask', title: 'Check your understanding', ms: 3400, pose: 'ask', look: 'class', student: 2,
        board: ['Remember', note ? note.watch : tab.tip],
        line: `Who can tell me one thing to watch out for? Yes, you at the back. ${note ? note.watch : tab.tip}`,
        say: `Who can tell me one thing to watch out for? Yes, you at the back. ${note ? note.watch : tab.tip}` });

    scenes.push({ id: 'bye', title: 'Wrap-up', ms: 2800, pose: 'greet', look: 'class',
        board: [title, 'Press Calculate for the full solution', 'Questions? Ask away!'],
        line: `That is ${title}. Press Calculate to see every step worked out on the page. Any questions? Thank you, class!` });
    return scenes;
}

function teacherTabLesson(info) {
    const tab = TEACHER_TABS[info.moduleKey] || TEACHER_TABS.descriptive;
    const topics = (info.topics || []).map(teacherClean).filter(Boolean);
    const shown = topics.slice(0, 5);
    const scenes = [];
    scenes.push({ id: 'hello', title: 'Welcome', ms: 2600, pose: 'greet', look: 'class', board: [tab.name, 'Welcome to class!'],
        line: `Good morning, class! Welcome to ${tab.name}.` });
    scenes.push({ id: 'goal', title: 'The big idea', ms: 3800, pose: 'explain', look: 'class', board: [tab.name, 'The big idea:', tab.goal], line: tab.goal });
    scenes.push({ id: 'method', title: 'The method', ms: 4000, pose: 'point', look: 'board', board: [tab.name, ...tab.steps], line: tab.say });
    if (topics.length) {
        scenes.push({ id: 'tour', title: 'Topics in this tab', ms: 4000, pose: 'write', look: 'board', board: [tab.name + ': topics', ...shown.map(t => '• ' + t), ...(topics.length > shown.length ? [`... and ${topics.length - shown.length} more`] : [])],
            line: `This tab has ${topics.length} topics, including ${shown.slice(0, -1).join(', ')}${shown.length > 1 ? ' and ' : ''}${shown[shown.length - 1]}. Choose any of them on the left and I will teach it.`,
            say: `This tab has ${topics.length} topics, including ${shown.slice(0, -1).join(', ')}${shown.length > 1 ? ', and ' : ''}${shown[shown.length - 1]}. Choose any of them in the menu on the left, and I will teach it.` });
    }
    scenes.push({ id: 'ask', title: 'One thing to remember', ms: 3200, pose: 'ask', look: 'class', student: 1, board: ['Remember', tab.tip], line: `Who can remember one rule for today? ${tab.tip}` });
    scenes.push({ id: 'bye', title: 'Your turn', ms: 2600, pose: 'greet', look: 'class', board: [tab.name, 'Pick a topic and press Play!'], line: 'Now pick a topic on the left and press Play, and I will teach it at the board. Off you go!' });
    return scenes;
}
