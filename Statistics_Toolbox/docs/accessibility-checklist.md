# Accessibility: what is automated and what needs a person

**Automated on every pull request** (`tests/e2e/a11y.js`, axe-core, WCAG 2.0/2.1 A and AA): names and roles of controls, labels, contrast, landmarks, keyboard access to scrollable tables, on every tool after its sample data has been calculated. `tests/e2e/print.js` checks the print layout.

**Needs a person with a screen reader** (10 minutes, once per release). Use NVDA (Windows, free), VoiceOver (macOS/iOS) or TalkBack (Android):

1. Open the page. Does the screen reader announce the title and the tab list ("Descriptive Statistics, tab 1 of 6")?
2. Press `/`, type "t-test", Enter. Is the match announced and does focus move to the tool?
3. Choose "Summary statistics", fill n, mean, s, press Calculate. Is "Answer: t = ..." announced without hunting for it?
4. Move through the worked solution. Are the steps readable in order, tables announced with their labels?
5. Find the graph. Is its text description (sample size, what it shows) read out?
6. Keyboard only: can everything above be done without a mouse? Is the focus ring always visible?
7. Print / Save as PDF: does the dialog open, and is the PDF text selectable?

Write down anything that failed with the tool name and the screen reader, and open an issue (the footer link goes to the feedback form).
