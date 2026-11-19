/**
 * mAyaNet Javascript Library
 *
 * @category Library
 * @package  Message box (deprecated)
 * @author   Murat AKSARAY <web@murataksaray.com>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     http://www.mayanets.com/
 *
*/
class MessageBox {
    constructor() {
        this.body = document.body;
        this.board = document.createElement('div');
        this.board.className = 'alert';
        const closeBtn = document.createElement('span');
        closeBtn.className = 'closebutton';
        closeBtn.innerHTML = '&times;';
        this.board.appendChild(closeBtn);
        this.body.appendChild(this.board);
        closeBtn.addEventListener('click', () => this.dispose());
    }

    async loadPage(pageUrl, width = null, height = null) {
        try {
            const response = await fetch(pageUrl);
            const html = await response.text();
            this.board.innerHTML = html;
        } catch {
            this.dispose();
        }
        if (width) this.board.style.width = width + 'px';
        if (height) this.board.style.height = height + 'px';
    }

    showText(msg, width = null, height = null) {
        this.board.textContent = msg;
        if (width) this.board.style.width = width + 'px';
        if (height) this.board.style.height = height + 'px';
    }

    showModal(msgContent) {
        this.background = document.createElement('div');
        this.background.className = 'modal';
        this.body.appendChild(this.background);
        this.background.addEventListener('click', () => this.dispose());
        this.showText(msgContent);
    }

    playFlv(flvUrl, width = 560, height = 315) {
        this.board.style.width = width + 'px';
        this.board.style.height = height + 'px';
        const videoFrame = document.createElement('iframe');
        videoFrame.setAttribute("frameborder", "0");
        videoFrame.width = width;
        videoFrame.height = height;
        videoFrame.src = flvUrl;
        this.board.appendChild(videoFrame);
    }

    dispose() {
        if (this.background) {
            this.background.remove();
            this.background = null;
        }
        if (this.board) {
            this.board.remove();
            this.board = null;
        }
    }
}
