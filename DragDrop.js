/**
 * mAyaNet Javascript Library
 *
 * @category Library
 * @package  Drag/Drop HTML elements (mobile supported)
 * @author   Murat AKSARAY <web@murataksaray.com>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     http://www.mayanets.com/
 *
*/
class DragDrop {
    Allow(e) {
        e.preventDefault();
    }

    Drag(e) {
        e.dataTransfer.setData("ddObject", e.target.id);
    }

    Drop(e) {
        e.target.appendChild(document.getElementById(e.dataTransfer.getData("ddObject")));
        e.preventDefault();
        e.stopPropagation();
    }

    Enter(e) {
        // e.target.style.cursor = 'wait';
    }

    Leave(e) { 
        // e.target.style.cursor = 'default';
    }

    End(e) {
        // e.source.style.cursor = 'default';
    }

    TouchStart(e) {
        e.preventDefault();
    }

    TouchMove(e) {
        e.dataTransfer.setData("ddObject", e.targetTouches[0].id);
        e.preventDefault();
    }

    TouchEnd(e) {
        e.targetTouches[0].appendChild(document.getElementById(e.dataTransfer.getData("ddObject")));
        e.preventDefault();
        e.stopPropagation();
    }

    TouchCancel(e) {
        e.preventDefault();
    }
}

let dragDrop = new DragDrop();