/**
 * mAyaNet Javascript Library
 *
 * @category Library
 * @package  Load content when the page scrolls
 * @author   Murat AKSARAY <web@murataksaray.com>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     http://www.mayanets.com/
 *
*/
class LoadOnScroll {
    constructor(containerObjectId, contentUrlToAdd) {
        if (typeof containerObjectId == 'string') {
            this.containerId = containerObjectId;
            this.contentUrl = contentUrlToAdd;
            this.refresh();
            let self = this;
            document.addEventListener("scroll", function (e) {
                let scrollPos = self.position();
                let docSize = self.size();
                if (docSize.height - 20 <= scrollPos.top) {
                    self.refresh();
                }
            });
        }
    }

    refresh() {
        let bufferDiv = document.createElement("div");
        bufferDiv.id = "bufferDiv";
        bufferDiv.style.display = "none";
        document.body.appendChild(bufferDiv);
        bufferDiv.innerHTML = fetch(this.contentURL).then(response => response).catch(error => error);
        let container = document.getElementById(this.containerId);
        container.innerHTML += bufferDiv.innerHTML;
        bufferDiv.remove();
    }

    position() {
        let x = 0;
        let y = 0;
        if (typeof (window.scrollY) == 'number') {
            x = window.scrollX;
            y = window.scrollY;
        }
        else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
            x = document.body.scrollLeft;
            y = document.body.scrollTop;
        }
        else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
            x = document.documentElement.scrollLeft;
            y = document.documentElement.scrollTop;
        }
        return { left: x, top: y };
    }

    size() {
        let w = Math.max(
            document.body.scrollWidth, document.documentElement.scrollWidth,
            document.body.offsetWidth, document.documentElement.offsetWidth,
            document.body.clientWidth, document.documentElement.clientWidth
        );
        let h = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
        return { width: w, height: h };
    }
}