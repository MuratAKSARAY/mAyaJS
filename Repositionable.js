/**
 * mAyaNet Javascript Library
 *
 * @category Library
 * @package  Convert any element to fluently
 * @author   Murat AKSARAY <web@murataksaray.com>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     http://www.mayanets.com/
 *
*/
class Repositionable {
    static start(target) {
        const element = typeof target === 'string' ? document.getElementById(target) : target;
        if (!element) {
            return;
        }

        let startX, startY, origLeft, origTop;
        let dragging = false;

        const onMouseDown = (e) => {
            dragging = true;
            const rect = element.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            origLeft = rect.left;
            origTop = rect.top;
            e.preventDefault();
        };

        const onMouseMove = (e) => {
            if (!dragging) {
                return;
            }
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            element.style.position = "absolute";
            element.style.left = origLeft + dx + "px";
            element.style.top = origTop + dy + "px";
            e.preventDefault();
        };

        const onMouseUp = () => {
            dragging = false;
        };

        element.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);

        element.addEventListener("touchstart", (e) => {
            dragging = true;
            const rect = element.getBoundingClientRect();
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            origLeft = rect.left;
            origTop = rect.top;
            e.preventDefault();
        });

        document.addEventListener("touchmove", (e) => {
            if (!dragging) {
                return;
            }
            const dx = e.touches[0].clientX - startX;
            const dy = e.touches[0].clientY - startY;
            element.style.position = "absolute";
            element.style.left = origLeft + dx + "px";
            element.style.top = origTop + dy + "px";
            e.preventDefault();
        });

        document.addEventListener("touchend", () => {
            dragging = false;
        });
    }
}
