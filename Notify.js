/**
 * mAyaNet Javascript Library
 *
 * @category Library
 * @package  Notification
 * @author   Murat AKSARAY <web@murataksaray.com>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     http://www.mayanets.com/
 *
*/
class Notify {
    static post(title, msg, img) {
        let support = 'Notification' in globalThis;
        if (support && this.permission()) {
            let message = new Notification(title, {
                body: msg,
                icon: img // optional
            });
            message.onclose = function () { return false; };
            message.onshow = function () { return false; };
            message.onclick = function () { return false; };
        }
    }
    static permission() {
        let p = false;
        Notification.requestPermission().then(function (result) { p = result == 'granted'; });
        return p;
    }
}