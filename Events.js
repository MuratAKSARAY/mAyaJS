globalThis.addEventListener('beforeprint',
    (e) => {
        let buttons = document.querySelectorAll("input[type='submit'], input[type='button']");
        buttons.forEach(b => b.hide());
        document.getElementById('leftMenu').hide();
    }
);

globalThis.addEventListener('afterprint',
    (e) => {
        let buttons = document.querySelectorAll("input[type='submit'], input[type='button']");
        buttons.forEach(b => b.show());
        document.getElementById('leftMenu').show();
    }
);