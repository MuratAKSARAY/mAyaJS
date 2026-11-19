/**
 * mAyaNet Javascript Library
 *
 * @category Library
 * @package  Right click on/off
 * @author   Murat AKSARAY <web@murataksaray.com>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     http://www.mayanets.com/
 *
*/
class RightClick {

    static init() {
        this.enabled = true;
        document.oncontextmenu = function () { return this.enabled; };
        document.onkeydown = function (e) { if (e.ctrlKey && e.key.toUpperCase() == 'M') { this.toggle(); } };
        document.onmousedown = function (e) { return this.enabled || e.button == 1; };
        document.onmouseup = function (e) { return this.enabled || e.button == 1; };
    }

    static toggle() {
        this.enabled = !this.enabled;
    }
}

RightClick.init();