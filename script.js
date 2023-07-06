(async function run() {
  const Page = {
    /**
     * @param {string} text
     * @return {Promise<Array<HTMLButtonElement>>}
     */
    getButtonsByText: async (text) => {
      const backoff = [200, 500, 1000, 2000, 5000];
      for (const duration of backoff) {
        console.log("Searching...", duration, text);
        const buttons = document.querySelectorAll("button");
        const foundButtons = Array.from(buttons).filter((button) => {
          return button.textContent === text;
        });
        if (foundButtons.length > 0) {
          console.log(`Found '${text}' buttons...`);
          return foundButtons;
        }
        await Page.sleep(duration);
      }
      return foundButtons;
    },
    /**
     * @param {HTMLButtonElement} button
     * @returns {void}
     */
    clickButton: (button) => {
      console.log(`Clicking "${button.textContent}" button...`);
      button.click();
    },
    /**
     * @param {number} duration
     * @returns {Promise<void>}
     */
    sleep: (duration) =>
      new Promise((resolve) => setTimeout(resolve, duration)),
    waitForUnfollowModal: async () => {
      const backoff = [200, 500, 1000, 2000, 5000];
      for (const duration of backoff) {
        console.log("Waiting...", duration);
        const spans = document.querySelectorAll("span");
        const foundSpans = Array.from(spans).filter((span) => {
          const found =
            span.textContent.includes("Unfollow @") ||
            span.textContent.includes("If you change your mind");
          return found;
        });
        if (foundSpans.length > 0) {
          console.log("Found Unfollow modal");
          return;
        }
        await Page.sleep(duration);
      }
      return;
    },
    isRateLimitReached: async () => {
      const backoff = [200, 500, 1000];
      for (const duration of backoff) {
        console.log("Waiting...", duration);
        const spans = document.querySelectorAll("span");
        const foundSpans = Array.from(spans).filter((span) => {
          const found = span.textContent.includes(
            "We limit how often you can do certain things on Instagram"
          );
          return found;
        });
        if (foundSpans.length > 0) {
          console.log("Limit is reached!");
          return true;
        }
        await Page.sleep(duration);
      }
      return false;
    },
  };

  let buttons = [];
  buttons = await Page.getButtonsByText("Following");
  await Page.sleep(1000);
  while (buttons.length > 1) {
    buttons = await Page.getButtonsByText("Following");
    const firstButton = buttons.at(0);
    if (!firstButton) return;
    Page.clickButton(firstButton);
    await Page.sleep(1000);
    await Page.waitForUnfollowModal();
    const unfollowButtons = await Page.getButtonsByText("Unfollow");
    const unfollowButton = unfollowButtons.at(0);
    if (!unfollowButton) return;
    Page.clickButton(unfollowButton);
    if (await Page.isRateLimitReached()) {
      return;
    }
    await Page.sleep(32000);
  }
})();
