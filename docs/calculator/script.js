document.addEventListener('DOMContentLoaded', () => {
    const suite = {
        // --- TABS ---
        initTabs() {
            const tabs = document.querySelector('.tabs');
            tabs.addEventListener('click', (e) => {
                if (e.target.classList.contains('tab-link')) {
                    this.openTab(e.target.dataset.tab);
                }
            });
            this.openTab('calculator'); // Open default tab
        },
        openTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
            document.querySelectorAll('.tab-link').forEach(tl => tl.classList.remove('active'));
            document.getElementById(tabName).classList.add('active');
            document.querySelector(`.tab-link[data-tab='${tabName}']`).classList.add('active');
        },

        // --- THEME ---
        initTheme() {
            document.getElementById('theme-switcher').addEventListener('click', () => {
                document.body.classList.toggle('light-theme');
            });
        },

        // --- CALCULATOR ---
        calculator: {
            display: null,
            memory: 0,
            isSecond: false,
            history: [],

            init() {
                this.display = document.getElementById('display');
                document.querySelector('.calculator-grid').addEventListener('click', (e) => this.handleButtonClick(e));
                document.getElementById('clear-history').addEventListener('click', () => this.clearHistory());
                document.getElementById('history-list').addEventListener('click', (e) => {
                    if (e.target.tagName === 'LI') {
                        this.display.value = e.target.dataset.expression;
                    }
                });
            },

            handleButtonClick(e) {
                if (!e.target.matches('button')) return;
                const btn = e.target;
                const value = btn.dataset.value;
                const func = btn.dataset.function;

                if (value) this.appendToDisplay(value);
                else if (func) this.executeFunction(func);
            },

            appendToDisplay(value) {
                this.display.value += value;
            },

            executeFunction(func) {
                const functions = {
                    'clear': () => { this.display.value = ''; },
                    'delete': () => { this.display.value = this.display.value.slice(0, -1); },
                    'calculate': () => {
                        try {
                            const expression = this.display.value
                                .replace(/π/g, 'Math.PI')
                                .replace(/e/g, 'Math.E');
                            const result = new Function('return ' + expression)();
                            this.addToHistory(this.display.value, result);
                            this.display.value = result;
                        } catch (error) {
                            this.display.value = 'Error';
                        }
                    },
                    '2nd': () => this.toggleSecondFunctions(),
                    'x2': () => this.appendToDisplay('**2'),
                    'x3': () => this.appendToDisplay('**3'),
                    '1/x': () => this.appendToDisplay('1/'),
                    'y-sqrt': () => this.appendToDisplay('**(1/'),
                    'pow': () => this.appendToDisplay('**'),
                    'log': () => this.appendToDisplay('Math.log10('),
                    'ln': () => this.appendToDisplay('Math.log('),
                    'sin': () => this.appendToDisplay('Math.sin('),
                    'cos': () => this.appendToDisplay('Math.cos('),
                    'tan': () => this.appendToDisplay('Math.tan('),
                    'fact': () => {
                        try {
                            const num = parseInt(new Function('return ' + this.display.value)());
                            if (num < 0) throw new Error();
                            let result = 1;
                            for (let i = 2; i <= num; i++) result *= i;
                            this.display.value = result;
                        } catch { this.display.value = 'Error'; }
                    },
                    'mc': () => { this.memory = 0; },
                    'mr': () => this.appendToDisplay(this.memory),
                    'm+': () => { this.memory += new Function('return ' + this.display.value || 0)(); this.display.value = ''; },
                    'm-': () => { this.memory -= new Function('return ' + this.display.value || 0)(); this.display.value = ''; },
                };
                if (functions[func]) functions[func]();
            },

            toggleSecondFunctions() {
                this.isSecond = !this.isSecond;
                document.querySelectorAll('[data-main]').forEach(btn => {
                    const mainFunc = btn.dataset.main;
                    const secondFunc = btn.dataset.second;
                    btn.dataset.function = this.isSecond ? secondFunc : mainFunc;
                    btn.innerHTML = this.isSecond ? btn.dataset.secondLabel : btn.dataset.mainLabel;
                });
            },

            addToHistory(expression, result) {
                this.history.unshift({ expression, result });
                if (this.history.length > 50) this.history.pop();
                this.updateHistoryUI();
            },
            clearHistory() {
                this.history = [];
                this.updateHistoryUI();
            },
            updateHistoryUI() {
                const historyList = document.getElementById('history-list');
                historyList.innerHTML = '';
                this.history.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = `${item.expression} = ${item.result}`;
                    li.dataset.expression = item.expression;
                    historyList.appendChild(li);
                });
            }
        },

        // --- PLOTTER ---
        plotter: {
            chart: null,
            init() {
                const ctx = document.getElementById('plot-canvas').getContext('2d');
                document.getElementById('plot-button').addEventListener('click', () => this.plot());
                this.chart = new Chart(ctx, {
                    type: 'line',
                    data: { labels: [], datasets: [{ label: 'f(x)', data: [], borderColor: '#00aaff', tension: 0.1 }] },
                    options: { scales: { x: { ticks: { color: '#888' } }, y: { ticks: { color: '#888' } } } }
                });
            },
            plot() {
                const funcStr = document.getElementById('function-input').value;
                try {
                    const func = new Function('x', 'return ' + funcStr);
                    const data = [], labels = [];
                    for (let x = -20; x <= 20; x += 0.5) {
                        labels.push(x.toString());
                        data.push(func(x));
                    }
                    this.chart.data.labels = labels;
                    this.chart.data.datasets[0].data = data;
                    this.chart.update();
                } catch (error) { alert('Invalid function: ' + error); }
            }
        },

        // --- CONVERTER ---
        converter: {
            units: {
                length: { m: 1, km: 1000, mi: 1609.34, ft: 0.3048, in: 0.0254 },
                mass: { g: 1, kg: 1000, lb: 453.592, oz: 28.35 },
                temperature: { c: 1, f: 1, k: 1 }, // Special handling
                speed: { 'm/s': 1, 'km/h': 0.277778, mph: 0.44704 }
            },
            init() {
                const categorySelect = document.getElementById('category-select');
                Object.keys(this.units).forEach(cat => categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`);
                categorySelect.addEventListener('change', () => this.updateUnitOptions());
                document.getElementById('unit-input').addEventListener('input', () => this.convert());
                document.getElementById('from-unit-select').addEventListener('change', () => this.convert());
                document.getElementById('to-unit-select').addEventListener('change', () => this.convert());
                this.updateUnitOptions();
            },
            updateUnitOptions() {
                const category = document.getElementById('category-select').value;
                const fromSelect = document.getElementById('from-unit-select');
                const toSelect = document.getElementById('to-unit-select');
                fromSelect.innerHTML = '';
                toSelect.innerHTML = '';
                Object.keys(this.units[category]).forEach(unit => {
                    fromSelect.innerHTML += `<option value="${unit}">${unit}</option>`;
                    toSelect.innerHTML += `<option value="${unit}">${unit}</option>`;
                });
                this.convert();
            },
            convert() {
                const category = document.getElementById('category-select').value;
                const input = parseFloat(document.getElementById('unit-input').value) || 0;
                const from = document.getElementById('from-unit-select').value;
                const to = document.getElementById('to-unit-select').value;
                let result;

                if (category === 'temperature') {
                    let c = input;
                    if (from === 'f') c = (input - 32) * 5 / 9;
                    if (from === 'k') c = input - 273.15;
                    if (to === 'f') result = (c * 9 / 5) + 32;
                    else if (to === 'k') result = c + 273.15;
                    else result = c;
                } else {
                    const baseValue = input * this.units[category][from];
                    result = baseValue / this.units[category][to];
                }
                document.getElementById('unit-output').value = result.toFixed(4);
            }
        },

        // --- INITIALIZE ALL ---
        init() {
            this.initTabs();
            this.initTheme();
            this.calculator.init();
            this.plotter.init();
            this.converter.init();
        }
    };

    suite.init();
});
