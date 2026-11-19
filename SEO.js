class SEO extends String {
    static encode() {
        let tr = 'çÇğĞıİöÖşŞüÜ';
        let en = 'ccggiioossuu';
        for (let i = 0; i < tr.length; i++) {
            this = this.replace(tr[i], en[i]);
        }
        return this.toLowerCase();
    }
}