/**
 * mAyaNet Javascript Library
 *
 * @category Library
 * @package  Google Maps API
 * @author   Murat AKSARAY <web@murataksaray.com>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     http://www.mayanets.com/
 *
*/
class Maps {
    constructor(api_key, mapElementId = "map", infoElementId = "info") {
        this.api_key = api_key;
        this.mapElementId = mapElementId;
        this.infoElementId = infoElementId;
        this.map = null;
        this.infoWindow = null;

        // Google Maps script yükle
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${this.api_key}`;
        script.onload = () => {
            this.initMap();
            this.currentLocation();
        };
        document.head.appendChild(script);
    }

    initMap() {
        this.map = new google.maps.Map(document.getElementById(this.mapElementId), {
            center: { lat: 39, lng: 35 }, // Türkiye ortası gibi varsayılan
            zoom: 6
        });
        this.infoWindow = new google.maps.InfoWindow();
    }

    currentLocation() {
        if (!this.map) return;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.showLocation(location, "Tarayıcı konumu bulundu.");
                },
                () => {
                    this.getLocationByIP();
                }
            );
        } else {
            this.getLocationByIP();
        }
    }

    async getLocationByIP() {
        try {
            const response = await fetch("http://ip-api.com/json/?fields=status,country,regionName,city,lat,lon,isp,query");
            const data = await response.json();
            if (data.status === "success") {
                const location = { lat: data.lat, lng: data.lon };
                const mapsLink = `https://www.google.com/maps?q=${data.lat},${data.lon}`;
                const content = `
                    <strong>IP:</strong> ${data.query}<br>
                    <strong>Ülke:</strong> ${data.country}<br>
                    <strong>İl:</strong> ${data.regionName}<br>
                    <strong>Şehir/İlçe:</strong> ${data.city}<br>
                    <strong>ISP:</strong> ${data.isp}<br>
                    <a href="${mapsLink}" target="_blank">Google Maps’te Aç</a>
                `;
                this.showLocation(location, content);
                this.showInfo(content);
            } else {
                this.handleLocationError(true, this.map.getCenter());
            }
        } catch (e) {
            console.log(e);
            this.handleLocationError(true, this.map.getCenter());
        }
    }

    showLocation(location, content, mapsLink) {
        this.infoWindow.setPosition(location);
        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map);
        this.map.setCenter(location);
        const marker = new google.maps.Marker({
            position: location,
            map: this.map,
            animation: google.maps.Animation.DROP
        });
        const markerInfo = new google.maps.InfoWindow({ content: content });
        marker.addListener("click", () => {
            markerInfo.open(this.map, marker);
        });
        const qrEl = document.getElementById(this.qrElementId);
        if (qrEl) {
            qrEl.innerHTML = "";
            new QRCode(qrEl, {
                text: mapsLink,
                width: 200,
                height: 200,
                colorDark: "#2c3e50",
                colorLight: "#ecf0f1",
                correctLevel: QRCode.CorrectLevel.H
            });
            const pngBtn = document.createElement("button");
            pngBtn.innerText = "PNG İndir";
            pngBtn.onclick = () => {
                const canvas = qrEl.querySelector("canvas");
                if (canvas) {
                    const dataUrl = canvas.toDataURL("image/png");
                    const link = document.createElement("a");
                    link.href = dataUrl;
                    link.download = "qrcode.png";
                    link.click();
                }
            };
            const svgBtn = document.createElement("button");
            svgBtn.innerText = "SVG İndir";
            svgBtn.onclick = () => {
                const canvas = qrEl.querySelector("canvas");
                if (canvas) {
                    const dataUrl = canvas.toDataURL("image/png");
                    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><image href="${dataUrl}" height="200" width="200"/></svg>`;
                    const blob = new Blob([svgContent], { type: "image/svg+xml" });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = "qrcode.svg";
                    link.click();
                }
            };
            const pdfBtn = document.createElement("button");
            pdfBtn.innerText = "PDF İndir";
            pdfBtn.onclick = () => {
                const canvas = qrEl.querySelector("canvas");
                if (canvas) {
                    const dataUrl = canvas.toDataURL("image/png");
                    const { jsPDF } = globalThis.jspdf;
                    const pdf = new jsPDF();
                    pdf.addImage(dataUrl, "PNG", 10, 10, 50, 50);
                    pdf.save("qrcode.pdf");
                }
            };
            qrEl.appendChild(pngBtn);
            qrEl.appendChild(svgBtn);
            qrEl.appendChild(pdfBtn);
        }
    }

    showInfo(content) {
        const infoEl = document.getElementById(this.infoElementId);
        if (infoEl) {
            infoEl.innerHTML = content;
        }
    }

    handleLocationError(browserHasGeolocation, pos) {
        this.infoWindow.setPosition(pos);
        this.infoWindow.setContent(
            browserHasGeolocation
                ? "HATA: Konum servisi başarısız."
                : "HATA: Tarayıcınız konum servisini desteklemiyor."
        );
        this.infoWindow.open(this.map);
    }

    goToLocation(title, content, latitude, longitude, zoom = 10) {
        if (!this.map) {
            return;
        }
        const location = { lat: latitude, lng: longitude };
        this.map.setCenter(location);
        this.map.setZoom(zoom);
        const marker = new google.maps.Marker({
            title: title,
            position: location,
            map: this.map,
            animation: google.maps.Animation.DROP,
            draggable: true
        });
        const infowindow = new google.maps.InfoWindow({ content: content });
        marker.addListener("click", () => {
            infowindow.open(this.map, marker);
        });
    }
}
