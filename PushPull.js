var pullCompleted = true;
var pushCompleted = true;
var pullOut = null;
var pushOut = null;

/**
 * mAyaNet Javascript Library
 *
 * @category Library
 * @package  Secret menu on page left or right
 * @author   Murat AKSARAY <web@murataksaray.com>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     http://www.mayanets.com/
 *
*/
class PushPull {
    static pull(obj) {
        if (!pushCompleted) {
            return true;
        }
        if (pullOut) {
            clearTimeout(pullOut);
            pullOut = null;
        }
        let targetVal = 0;
        let pos = obj.style.left ? parseInt(obj.style.left) : 0;
        if (targetVal == pos) {
            pullCompleted = true;
            return true;
        }
        pos += Math.max(Math.abs(Math.ceil((targetVal - pos) / 10)), 1);
        obj.style.left = pos + 'px';
        pullCompleted = false;
        pullOut = setTimeout(function () { pullObject(obj); }, 10);
    }

    static push(obj) {
        if (!pullCompleted) {
            return true;
        }
        if (pushOut) {
            clearTimeout(pushOut);
            pushOut = null;
        }
        let targetVal = -200;
        let pos = obj.style.left ? parseInt(obj.style.left) : 0;
        if (targetVal == pos) {
            pushCompleted = true;
            return true;
        }
        pos -= Math.max(Math.abs(Math.ceil((targetVal - pos) / 10)), 1);
        obj.style.left = pos + 'px';
        pushCompleted = false;
        pushOut = setTimeout(function () { pushObject(obj); }, 10);
    }
}