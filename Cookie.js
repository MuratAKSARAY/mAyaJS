/**
 * mAyaNet Javascript Library
 *
 * @category Library
 * @package  Get/Set cookies
 * @author   Murat AKSARAY <web@murataksaray.com>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     http://www.mayanets.com/
 *
*/
class Cookie {
    static get(CookieName) {
        let val = document.cookie;
        let pos = val.indexOf(" " + CookieName + "=");
        if (pos == -1)
            pos = val.indexOf(CookieName + "=");
        if (pos == -1)
            val = null;
        else {
            pos = val.indexOf("=", pos) + 1;
            let len = val.indexOf(";", pos);
            if (len == -1)
                len = val.length;
            val = val.substring(pos, len);
        }
        return val;
    };

    static set(CookieName, CookieValue, Expires) {
        let exdate = new Date();
        exdate.setDate(exdate.getDate() + Expires);
        CookieValue = CookieValue + ((Expires == null) ? "" : "; expires=" + exdate.toUTCString());
        document.cookie = `${CookieName}=${CookieValue}`;
    };
}
