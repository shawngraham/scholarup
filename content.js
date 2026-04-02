chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrape") {
    const results = [];
    
    // 1. Try to find the Source Article Title (usually in the blue bar/header)
    const sourceElement = document.querySelector('#gs_rt_hdr a') || document.querySelector('#gs_rt_hdr');
    const sourceTitle = sourceElement ? sourceElement.innerText.replace("Articles citing:", "").trim() : "Unknown Source";

    // 2. Scrape Result Items
    const items = document.querySelectorAll('.gs_ri');
    items.forEach(item => {
      const titleElement = item.querySelector('.gs_rt a');
      const descElement = item.querySelector('.gs_a');
      const footerLinks = item.querySelectorAll('.gs_fl a');

      let citedByCount = "0";
      footerLinks.forEach(link => {
        if (link.innerText.includes('Cited by')) {
          citedByCount = link.innerText.replace('Cited by ', '');
        }
      });

      results.push({
        sourceArticle: sourceTitle,
        title: titleElement ? titleElement.innerText : "No Title",
        url: titleElement ? titleElement.href : "",
        metadata: descElement ? descElement.innerText : "",
        citedByCount: citedByCount
      });
    });

    // 3. Find the "Next" page URL
    const nextButton = Array.from(document.querySelectorAll('#gs_n a')).find(a => 
      a.innerText.includes('Next') || a.querySelector('.gs_ico_nav_next')
    );

    sendResponse({ 
      data: results, 
      nextUrl: nextButton ? nextButton.href : null 
    });
  }
});