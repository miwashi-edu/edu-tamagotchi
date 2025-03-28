class Tamagotchi {
    static speciesList = ['dog', 'cat', 'dragon', 'alien'];

    constructor(name, species = 'dog', ctx = null, logDiv = null) {
        species = species.toLowerCase();

        if (!Tamagotchi.speciesList.includes(species)) {
            throw new Error(`Invalid species. Choose from: ${Tamagotchi.speciesList.join(', ')}`);
        }

        this.name = name;
        this.species = species;
        this.hunger = 5;
        this.happiness = 5;
        this.age = 0;
        this.alive = true;
        this.logDiv = logDiv;

        if (ctx) {
            this.ctx = ctx;
        } else {
            const canvas = document.getElementById('tamagotchi-canvas');
            if (!canvas) throw new Error('Canvas not found and no context provided.');
            this.ctx = canvas.getContext('2d');
        }

        this.animations = {
            feed: {
                repeat: 3,
                duration: 1000,
                frames: [
                    `images/${this.species}/feed1.png`,
                    `images/${this.species}/feed2.png`,
                    `images/${this.species}/feed3.png`
                ]
            },
            play: {
                repeat: 3,
                duration: 1000,
                frames: [
                    `images/${this.species}/play1.png`,
                    `images/${this.species}/play2.png`,
                    `images/${this.species}/play3.png`
                ]
            },
            pet: {
                repeat: 3,
                duration: 1000,
                frames: [
                    `images/${this.species}/pet1.png`,
                    `images/${this.species}/pet2.png`,
                    `images/${this.species}/pet3.png`
                ]
            }
        };


        this.draw('idle');
        this.startAging();
    }

    startAging() {
        if (this.ageInterval) return; // prevent multiple timers

        this.ageInterval = setInterval(() => {
            if (!this.alive) return;

            this.age++;
            this.hunger = Math.min(10, this.hunger + 0.1);
            this.happiness = Math.max(0, this.happiness - 0.05);
            this.checkAlive();
        }, 1000);
    }

    async perform(action, message) {
        if (!this.alive) return `${this.name} is no longer alive.`;

        const animation = this.animations[action];
        if (!animation) return `Unknown action: ${action}`;

        await this.animateFrames(animation);
        switch (action) {
            case 'feed':
                this.hunger = Math.max(0, this.hunger - 1);
                break;
            case 'play':
                this.happiness = Math.min(10, this.happiness + 1);
                this.hunger = Math.min(10, this.hunger + 1);
                break;
            case 'pet':
                this.happiness = Math.min(10, this.happiness + 0.5);
                break;
            default:
                return `Unknown action: ${action}`;
        }

        this.checkAlive();
        this.log(message);
        return `${this.name} ${message}`;
    }

    status() {
        return Promise.resolve({ ...this });
    }

    checkAlive() {
        if (this.hunger >= 10 || this.happiness <= 0) {
            this.alive = false;
            clearInterval(this.ageInterval);
            this.log(`has died.`);
            this.draw('dead'); // ← NEW
        }
    }

    draw(state) {
        const ctx = this.ctx;
        const canvas = ctx.canvas;
        const img = new Image();

        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };

        img.onerror = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = '16px monospace';
            ctx.fillStyle = (state === 'dead') ? 'red' : '#000';
            ctx.fillText(state.charAt(0).toUpperCase() + state.slice(1), 10, 20);
        };

        img.src = `images/${this.species}/${state}.png`;
    }

    animateFrames(animation) {
        const ctx = this.ctx;
        const canvas = ctx.canvas;
        const frames = animation.frames;
        const repeatCount = animation.repeat || 1;
        const duration = animation.duration || 1000;
        const frameTime = duration / frames.length;

        return new Promise((resolve) => {
            let cycle = 0;
            let index = 0;

            const showFrame = () => {
                const img = new Image();
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                    ctx.font = '16px monospace';
                    ctx.fillText(`${index + 1}/${frames.length}`, 8, 20);
                };

                img.onerror = () => {
                    console.warn(`Failed to load image: ${img.src}`);
                };

                img.src = frames[index];

                index++;
                if (index >= frames.length) {
                    index = 0;
                    cycle++;
                }

                if (cycle < repeatCount) {
                    setTimeout(showFrame, frameTime);
                } else {
                    setTimeout(() => {
                        this.draw('idle');
                        resolve();
                    }, frameTime);
                }
            };

            showFrame();
        });
    }

    log(message) {
        if (!this.logDiv) return;

        const bubble = document.createElement('div');
        bubble.className = 'log-entry';
        const time = new Date().toLocaleTimeString();
        bubble.textContent = `[${time}] ${this.name} ${message}`;
        this.logDiv.prepend(bubble);
    }
}
