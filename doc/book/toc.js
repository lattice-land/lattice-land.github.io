// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded "><a href="index.html"><strong aria-hidden="true">1.</strong> Lattice Land</a></li><li class="chapter-item expanded affix "><li class="part-title">CUDA Battery Library</li><li class="chapter-item expanded "><a href="1-cuda-battery.html"><strong aria-hidden="true">2.</strong> Introduction</a></li><li class="chapter-item expanded "><a href="2-cuda-battery.html"><strong aria-hidden="true">3.</strong> Data from CPU to GPU</a></li><li class="chapter-item expanded "><a href="3-cuda-battery.html"><strong aria-hidden="true">4.</strong> CMake Project</a></li><li class="chapter-item expanded "><a href="4-cuda-battery.html"><strong aria-hidden="true">5.</strong> In-Kernel Allocation</a></li><li class="chapter-item expanded "><a href="5-cuda-battery.html"><strong aria-hidden="true">6.</strong> Shared Memory Allocator</a></li><li class="chapter-item expanded "><a href="6-cuda-battery.html"><strong aria-hidden="true">7.</strong> Caution</a></li><li class="chapter-item expanded affix "><li class="part-title">Seminars</li><li class="chapter-item expanded "><a href="abstract-week.html"><strong aria-hidden="true">8.</strong> Abstract Interpretation Workshop (2024)</a></li><li class="chapter-item expanded affix "><li class="part-title">Turbo Technical Journal</li><li class="chapter-item expanded "><a href="1-turbo.html"><strong aria-hidden="true">9.</strong> Introducing Turbo</a></li><li class="chapter-item expanded "><a href="2-turbo.html"><strong aria-hidden="true">10.</strong> v1.0.1: Unoptimized Turbo</a></li><li class="chapter-item expanded "><a href="3-turbo.html"><strong aria-hidden="true">11.</strong> v1.1.{0-1}: Preprocessing</a></li><li class="chapter-item expanded "><a href="4-turbo.html"><strong aria-hidden="true">12.</strong> v1.1.2: (Dis)equality Propagator</a></li><li class="chapter-item expanded "><a href="5-turbo.html"><strong aria-hidden="true">13.</strong> v1.1.3: Warp Synchronization</a></li><li class="chapter-item expanded "><a href="6-turbo.html"><strong aria-hidden="true">14.</strong> v1.1.{4-5}: Sorting Propagators</a></li><li class="chapter-item expanded "><a href="7-turbo.html"><strong aria-hidden="true">15.</strong> v1.1.{6-7}: Sharing Propagators</a></li><li class="chapter-item expanded "><a href="8-turbo.html"><strong aria-hidden="true">16.</strong> v1.2.0: Refactoring</a></li><li class="chapter-item expanded "><a href="9-turbo.html"><strong aria-hidden="true">17.</strong> v1.2.{1-3}: Open Hackathon</a></li><li class="chapter-item expanded "><a href="10-turbo.html"><strong aria-hidden="true">18.</strong> v1.2.4: Ternary Normal Form</a></li><li class="chapter-item expanded affix "><li class="part-title">About</li><li class="chapter-item expanded "><a href="about.html"><strong aria-hidden="true">19.</strong> About</a></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString();
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
