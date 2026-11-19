/**
 * mAyaNet Javascript Library
 *
 * @category Library
 * @package  Slider (deprecated)
 * @author   Murat AKSARAY <web@murataksaray.com>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     http://www.mayanets.com/
 *
*/
class Slider {
    constructor(container) {
        if (container == undefined) {
            container = 'mAyaSlider';
        }
        this.container = typeof container === 'string' ? objdocument.getElementById(container) : container;
        if (this.container == undefined) {
            return;
        } else {
            this.scrollSpeed = 15;
            this.scrollPixel = 10;
            this.scrollDelay = 7000;
            this.paging = true;
            this.autokey = true;
            this.direction = 0; // 0-up, 1-down, 2-left, 3-right
            this.divList = this.container.getElementsByTagName('div')[0];
            this.listContent = this.divList.getElementsByTagName('div');
        }
    }

    init() {
        this.selectedIndex = 0;
        this.boardWidth = parseInt(this.container.getWidth());
        this.boardHeight = parseInt(this.container.getHeight());
        if (this.paging && !this.pager) {
            this.addPaging();
        }
        this.divList.style.cssText = 'position: absolute; ' + (this.direction < 2 ? 'width: 100%' : 'width: ' + this.boardWidth * this.listContent.length + 'px') + '; overflow: hidden; padding: 0px; margin: 0px;';
        for (let content of this.listContent) {
            let direction = this.direction < 2 ? '' : ' float: right;';
            if (this.direction == 2) {
                direction = ' float: left;';
            }
            content.style.cssText += 'position: relative; width: ' + this.boardWidth + 'px; height: ' + this.boardHeight + 'px; overflow: hidden; padding: 0px; margin: 0px; text-align: left;' + direction;
            if (content.title != undefined && content.title != '') {
                let slideTitle = document.createElement('span');
                slideTitle.style.cssText = 'position: absolute; bottom: 0px; left: 0px; width: 100%; background-color: #000; color: #ffdf00; filter: alpha(opacity=80); opacity: 0.80; height: 30px; overflow: hidden; margin: 0px; text-align: center; line-height: 15px; vertical-align: middle; font: 18px/1.8 Moire, Arial, Verdana, Helvetica, sans-serif;';
                slideTitle.innerHTML = content.title;
                content[ix].appendChild(slideTitle);
            }
        }
    }

    addPaging() {
        this.pager = document.createElement('div');
        this.pager.style.cssText = 'position: absolute; line-height: 30px; cursor: pointer;';
        switch (this.direction) {
            case 1: //down
                this.pager.style.cssText += 'left: 20px; bottom: 35px; width: 36px;';
                break;
            case 2: //left
                this.pager.style.cssText += 'right: 20px; bottom: 6px; width: ' + (36 * this.listContent.length) + 'px;';
                break;
            case 3: //right
                this.pager.style.cssText += 'right: 20px; top: 20px; width: ' + (36 * this.listContent.length) + 'px;';
                break;
            default:
                this.pager.style.cssText += 'left: 20px; top: 20px; width: 36px;';
                break;
        }
        this.container.appendChild(this.pager);
        for (let ix = 0; ix < this.listContent.length; ix++) {
            let bullet = document.createElement('div');
            bullet.id = 'page' + ix;
            bullet.style.cssText = 'margin: 3px; cursor: pointer; width: 12px; height: 12px; background-color: #ffffff; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px;' + (this.direction < 2 ? '' : 'float: left;');
            this.pager.appendChild(bullet);
        }
    }

    moveElement() {
        if (this.movement) {
            clearTimeout(this.movement);
        }
        let final_x = 0;
        let final_y = 0;
        switch (this.direction) {
            case 1: //down
                final_y = this.divList.getHeight() - this.selectedIndex * this.boardHeight;
                break;
            case 2: //left
                final_x = 0 - this.selectedIndex * this.boardWidth;
                break;
            case 3: //right
                final_x = this.divList.getWidth() - this.selectedIndex * this.boardWidth;
                break;
            default: //up
                final_y = 0 - this.selectedIndex * this.boardHeight;
                break;
        }
        let xpos = parseInt(this.divList.style.left);
        let ypos = parseInt(this.divList.style.top);
        if (xpos == final_x && ypos == final_y)
            return true;
        if (xpos < final_x) {
            let dist = Math.ceil((final_x - xpos) / this.scrollPixel);
            xpos = xpos + dist;
        }
        if (xpos > final_x) {
            let dist = Math.ceil((xpos - final_x) / this.scrollPixel);
            xpos = xpos - dist;
        }
        if (ypos < final_y) {
            let dist = Math.ceil((final_y - ypos) / this.scrollPixel);
            ypos = ypos + dist;
        }
        if (ypos > final_y) {
            let dist = Math.ceil((ypos - final_y) / this.scrollPixel);
            ypos = ypos - dist;
        }
        this.divList.style.left = xpos + "px";
        this.divList.style.top = ypos + "px";
        this.movement = setTimeout(() => { this.moveElement(); }, this.scrollSpeed);
    }

    run() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.init();
        switch (this.direction) {
            case 1:
                this.divList.style.left = '0px';
                this.divList.style.top = (this.divList.getHeight() - this.boardHeight * this.selectedIndex) + 'px';
                break;
            case 3:
                this.divList.style.left = (this.divList.getWidth() - this.boardWidth * this.selectedIndex) + 'px';
                this.divList.style.top = '0px';
                break;
            default:
                this.divList.style.left = '0px';
                this.divList.style.top = '0px';
                break;
        }
        document.getElementById('page' + this.selectedIndex).style.backgroundColor = '#ff0000';
        this.container.addEvent('mouseover', () => { this.autokey = false; });
        this.container.addEvent('mouseout', () => { this.autokey = true; });
        globalThis.onresize = () => { this.resize(); };
        if (this.paging) {
            let bullets = this.pager.getElementsByTagName('div');
            for (let bullet of bullets) {
                bullet.addEvent('click', (e) => this.bulletClick(e));
            }
        }
        this.interval = setInterval(() => this.autoSlide(), this.scrollDelay);
    }

    bulletClick(e) {
        if (this.interval) {
            clearInterval(this.interval);
        }
        let target = e.target || e.srcElement;
        document.getElementById('page' + this.selectedIndex).style.backgroundColor = '#ffffff';
        this.selectedIndex = parseInt(target.id.substring(4)) - 1;
        if (this.selectedIndex < 0) {
            this.selectedIndex = this.listContent.length - 1;
        }
        this.autokey = true;
        this.autoSlide();
        this.interval = setInterval(() => this.autoSlide(), this.scrollDelay);
    }

    autoSlide() {
        if (this.container == undefined || !this.autokey) {
            return false;
        }
        document.getElementById('page' + this.selectedIndex).style.backgroundColor = '#ffffff';
        this.selectedIndex++;
        if (this.selectedIndex == this.listContent.length) {
            this.selectedIndex = 0;
        }
        document.getElementById('page' + this.selectedIndex).style.backgroundColor = '#ff0000';
        this.moveElement();
    }

    resize() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        let oldIndex = this.selectedIndex;
        this.init();
        this.selectedIndex = oldIndex - 1;
        if (this.selectedIndex < 0) {
            this.selectedIndex = this.listContent.length - 1;
        }
        switch (this.direction) {
            case 1:
                this.divList.style.left = '0px';
                this.divList.style.top = (this.divList.getHeight() - this.boardHeight * this.selectedIndex) + 'px';
                break;
            case 2:
                this.divList.style.left = (this.boardWidth * this.selectedIndex) + 'px';
                this.divList.style.top = '0px';
                break;
            case 3:
                this.divList.style.left = (this.divList.getWidth() - this.boardWidth * this.selectedIndex) + 'px';
                this.divList.style.top = '0px';
                break;
            default:
                this.divList.style.left = '0px';
                this.divList.style.top = (this.boardHeight * this.selectedIndex) + '0px';
                break;
        }
        this.autoSlide();
        this.interval = setInterval(() => this.autoSlide(), this.scrollDelay);
    }
}