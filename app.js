/* 득템쇼핑 · 오늘의 특가 모음
   deals.json 하나만 고치면 페이지가 갱신됩니다. */
(function () {
  "use strict";

  var state = { data: null, query: "" };

  var elList = document.getElementById("list");
  var elEmpty = document.getElementById("empty");
  var elQ = document.getElementById("q");
  var elClear = document.getElementById("clear");

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function won(n) {
    return Number(n).toLocaleString("ko-KR") + "원";
  }

  function norm(s) {
    return String(s || "").toLowerCase().replace(/\s+/g, "");
  }

  function todaySeoul() {
    try {
      return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }

  function matches(item, group, q) {
    if (!q) return true;
    var hay = norm(
      [item.brand, item.title, item.tag, group.platformName, item.rating ? "평점" + item.rating : ""].join(" ")
    );
    return hay.indexOf(q) !== -1;
  }

  function itemHTML(item, group) {
    var plat = group.platform === "coupang" ? "coupang" : "toss";
    var platLabel = plat === "coupang" ? "쿠팡" : "토스";
    var meta = "";
    if (item.rating) {
      meta =
        '<div class="meta">평점 ' +
        esc(item.rating) +
        (item.reviews ? " · 리뷰 " + Number(item.reviews).toLocaleString("ko-KR") : "") +
        "</div>";
    }
    return (
      '<a class="card" href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer sponsored" ' +
      'aria-label="' + esc(item.brand + " " + item.title + " " + won(item.price) + " " + group.platformName) + '">' +
        '<div class="thumb">' +
          '<img src="' + esc(item.image) + '" alt="' + esc(item.title) + '" width="92" height="92" loading="lazy" decoding="async">' +
          '<span class="plat ' + plat + '">' + platLabel + "</span>" +
        "</div>" +
        '<div class="info">' +
          '<div class="topline">' +
            '<span class="brand-name">' + esc(item.brand) + "</span>" +
            (item.tag ? '<span class="tag">' + esc(item.tag) + "</span>" : "") +
          "</div>" +
          '<h3 class="name">' + esc(item.title) + "</h3>" +
          '<div class="price">' +
            '<span class="pct">' + esc(item.discount) + "%</span>" +
            '<span class="now">' + won(item.price) + "</span>" +
            (item.originPrice ? '<span class="was">' + won(item.originPrice) + "</span>" : "") +
          "</div>" +
          meta +
        "</div>" +
        '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"></path></svg>' +
      "</a>"
    );
  }

  function render() {
    var data = state.data;
    if (!data) return;

    var q = norm(state.query);
    var today = todaySeoul();
    var html = "";
    var shown = 0;

    data.days.forEach(function (day) {
      var groupsHTML = "";

      day.groups.forEach(function (group) {
        var items = group.items.filter(function (it) {
          return matches(it, group, q);
        });
        if (!items.length) return;
        shown += items.length;

        var platKey = group.platform === "coupang" ? "coupang" : "toss";
        groupsHTML +=
          '<section class="group">' +
            '<div class="group-head">' +
              '<span class="dot ' + platKey + '"></span>' +
              '<span class="group-name">' + esc(group.platformName) + "</span>" +
              '<span class="group-count">' + items.length + "개</span>" +
            "</div>" +
            (group.note && !q ? '<p class="group-note">' + esc(group.note) + "</p>" : "") +
            '<div class="cards">' +
              items.map(function (it) { return itemHTML(it, group); }).join("") +
            "</div>" +
          "</section>";
      });

      if (!groupsHTML) return;

      html +=
        '<section class="day" data-date="' + esc(day.date) + '">' +
          '<div class="day-head">' +
            '<span class="day-date">' + esc(day.label || day.date) + "</span>" +
            (day.date === today ? '<span class="day-today">오늘</span>' : "") +
          "</div>" +
          (day.summary && !q ? '<p class="day-summary">' + esc(day.summary) + "</p>" : "") +
          groupsHTML +
        "</section>";
    });

    elList.innerHTML = html;
    elEmpty.hidden = !(q && shown === 0);
    if (q && shown > 0) {
      var first = elList.querySelector(".day-head");
      if (first) {
        var chip = document.createElement("span");
        chip.className = "day-today";
        chip.textContent = "검색 " + shown + "개";
        chip.style.background = "rgba(255,255,255,0.08)";
        chip.style.color = "#c8cfdb";
        first.appendChild(chip);
      }
    }
  }

  function renderSite(site) {
    if (site.title) {
      document.getElementById("site-title").textContent = site.title;
      document.title = site.title + " · " + (site.subtitle || "");
    }
    if (site.subtitle) document.getElementById("site-sub").textContent = site.subtitle;
    if (site.disclosure) {
      document.getElementById("disclosure").textContent = site.disclosure;
      document.getElementById("footer-disclosure").textContent = site.disclosure;
    }
    if (site.notice) document.getElementById("notice").textContent = site.notice;

    var nav = document.getElementById("socials");
    if (site.links && site.links.length) {
      nav.innerHTML = site.links
        .map(function (l) {
          return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' + esc(l.label) + "</a>";
        })
        .join("");
    }
  }

  function bindSearch() {
    var t = null;
    elQ.addEventListener("input", function () {
      elClear.hidden = !elQ.value;
      clearTimeout(t);
      t = setTimeout(function () {
        state.query = elQ.value.trim();
        render();
      }, 90);
    });
    elClear.addEventListener("click", function () {
      elQ.value = "";
      elClear.hidden = true;
      state.query = "";
      render();
      elQ.focus();
    });
    elQ.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        elQ.value = "";
        elClear.hidden = true;
        state.query = "";
        render();
      }
    });
  }

  bindSearch();

  fetch("deals.json?v=" + Date.now(), { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("deals.json " + r.status);
      return r.json();
    })
    .then(function (data) {
      state.data = data;
      if (data.site) renderSite(data.site);
      render();
    })
    .catch(function (err) {
      elList.innerHTML =
        '<p style="padding:40px 4px;color:#9aa2b1;font-size:13px;text-align:center">' +
        "상품 목록을 불러오지 못했어요. 잠시 후 새로고침해 주세요.</p>";
      console.error(err);
    });
})();
