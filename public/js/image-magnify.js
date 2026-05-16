export class ImageHoverZoom extends HTMLElement {
    static register(tagName) {
        customElements.define(tagName || "image-hover-zoom", ImageHoverZoom);
    }

    #pointerX = 0;
    #pointerY = 0;

    connectedCallback() {
        /* Add and update Shadow DOM */
        this.frame = document.createElement("div");
        this.frame.append(document.createElement("slot"));
        this.attachShadow({ mode: "open" });
        this.shadowRoot.append(this.frame);

        /*  Accessibility features */
        this.tabIndex = "0";
        this.role = "figure";
        this.ariaLabel =
            this.dataset.label ||
            "Use your mouse, touch, or arrow keys to zoom in on an area of the image.";

        /* Stylesheet */
        let sheet = new CSSStyleSheet();
        /* css */
        sheet.replaceSync(
            `div { 
            display: inline-block; 
            overflow: hidden;
          }
          `
        );
        this.shadowRoot.adoptedStyleSheets.push(sheet);

        /* Values */
        this.scale = Number(this.dataset.scale) || 2;
        this.keyDistance = Number(this.dataset.keyDistance) || 30;
        this.img = this.querySelector("img");

        /* Init functions */
        this.bindEvents();
    }

    bindEvents() {
        this.frame.addEventListener("pointerenter", (e) => {
            this.handlePointerenter(e);
        });

        this.frame.addEventListener("pointermove", (e) => {
            this.handlePointermove(e);
        });

        this.frame.addEventListener("pointerleave", (e) => {
            this.unzoom();
        });

        this.addEventListener("focus", () => {
            this.zoom();
        });

        this.addEventListener("blur", () => {
            this.unzoom();
        });

        this.addEventListener("keydown", (e) => {
            this.handleKeydown(e);
        });

        // Prevents scrolling on mobile
        this.addEventListener(
            "touchstart",
            (e) => {
                e.preventDefault();
            },
            {
                passive: false,
            }
        );
    }

    handlePointerenter(e) {
        this.zoom();
        this.handlePointermove(e);
    }

    handlePointerleave(e) {
        this.unzoom();
    }

    handlePointermove(e) {
        const frameRect = this.frame.getBoundingClientRect();
        this.#pointerX = e.clientX - frameRect.left;
        this.#pointerY = e.clientY - frameRect.top;

        this.scrollFrame();
    }

    scrollFrame() {
        const imgRect = this.img.getBoundingClientRect();
        const frameWidth = this.frame.offsetWidth;
        const frameHeight = this.frame.offsetHeight;

        const percentX = this.#pointerX / frameWidth;
        const percentY = this.#pointerY / frameHeight;

        const scrollX =
            (imgRect.width * percentX) /
            (imgRect.width / (imgRect.width - frameWidth));
        const scrollY =
            (imgRect.height * percentY) /
            (imgRect.height / (imgRect.height - frameHeight));

        this.frame.scrollLeft = scrollX;
        this.frame.scrollTop = scrollY;
    }

    handleKeydown(e) {
        const frameWidth = this.frame.offsetWidth;
        const frameHeight = this.frame.offsetHeight;

        const arrowKeyHandler = {
            ArrowLeft: () => {
                this.#pointerX = Math.max(0, this.#pointerX - this.keyDistance);
            },
            ArrowRight: () => {
                this.#pointerX = Math.min(
                    frameWidth,
                    this.#pointerX + this.keyDistance
                );
            },
            ArrowUp: () => {
                this.#pointerY = Math.max(0, this.#pointerY - this.keyDistance);
            },
            ArrowDown: () => {
                this.#pointerY = Math.min(
                    frameHeight,
                    this.#pointerY + this.keyDistance
                );
            },
        }[e.key];

        if (arrowKeyHandler) {
            e.preventDefault();
            arrowKeyHandler();
            this.scrollFrame();
        }
    }

    zoom() {
        if (this.dataset.src) {
            this.originalSrc = this.img.currentSrc;
            this.originalSrcset = this.img.getAttribute("srcset");
            this.img.setAttribute("src", this.dataset.src);
            this.img.removeAttribute("srcset");
        }
        this.img.style.transform = `scale(${this.scale})`;
        this.img.style.transformOrigin = "0 0";
    }

    unzoom() {
        if (this.originalSrc) {
            this.img.setAttribute("src", this.originalSrc);
        }

        if (this.originalSrcset) {
            this.img.setAttribute("srcset", this.originalSrcset);
        }

        this.img.style.removeProperty("transform");
        this.img.style.removeProperty("transformOrigin");
    }
}

ImageHoverZoom.register();