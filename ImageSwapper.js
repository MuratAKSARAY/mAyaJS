/**
 * mAyaNet Javascript Library
 *
 * @category Library
 * @package  Swap two images positions
 * @author   Murat AKSARAY <web@murataksaray.com>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     http://www.mayanets.com/
 *
*/
class ImageSwapper {
    Allow(e) {
        e.preventDefault();
    }

    Drag(e) {
        e.dataTransfer.setData("imageId", e.target.id);
    }

    Drop(e) {
        e.preventDefault();
        let source = document.getElementById(e.dataTransfer.getData("imageId"));
        let target = document.getElementById(e.target.id);
        let img = source.src;
        source.src = target.src;
        target.src = img;
    }
}

let imageSwapper = new ImageSwapper();