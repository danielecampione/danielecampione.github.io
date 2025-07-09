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
                if (value === 'π') {
                    this.display.value += 'Math.PI';
                } else if (value === 'e') {
                    this.display.value += 'Math.E';
                } else if (value === '+/-') {
                    if (this.display.value.startsWith('-')) {
                        this.display.value = this.display.value.slice(1);
                    } else {
                        this.display.value = '-' + this.display.value;
                    }
                } else {
                    this.display.value += value;
                }
            },

            executeFunction(func) {
                const functions = {
                    'clear': () => { this.display.value = ''; },
                    'delete': () => { this.display.value = this.display.value.slice(0, -1); },
                    'calculate': () => {
                        try {
                            const expression = this.display.value;
                            const result = new Function('return ' + expression)();
                            this.addToHistory(expression, result);
                            this.display.value = result.toString();
                        } catch (error) {
                            this.display.value = 'Error';
                        }
                    },
                    '2nd': () => this.toggleSecondFunctions(),
                    'x2': () => this.appendToDisplay('**2'),
                    'x3': () => this.appendToDisplay('**3'),
                    '1/x': () => this.display.value = `1/(${this.display.value})`,
                    'abs': () => this.display.value = `Math.abs(${this.display.value})`,
                    'sqrt': () => this.appendToDisplay('Math.sqrt('),
                    'y-sqrt': () => this.appendToDisplay('**(1/'),
                    'pow': () => this.appendToDisplay('**'),
                    'log': () => this.appendToDisplay('Math.log10('),
                    'ln': () => this.appendToDisplay('Math.log('),
                    'sin': () => this.appendToDisplay('Math.sin('),
                    'cos': () => this.appendToDisplay('Math.cos('),
                    'tan': () => this.appendToDisplay('Math.tan('),
                    'asin': () => this.appendToDisplay('Math.asin('),
                    'acos': () => this.appendToDisplay('Math.acos('),
                    'atan': () => this.appendToDisplay('Math.atan('),
                    'fact': () => {
                        try {
                            const num = parseInt(new Function('return ' + this.display.value)());
                            if (num < 0) throw new Error();
                            let result = 1;
                            for (let i = 2; i <= num; i++) result *= i;
                            this.display.value = result.toString();
                        } catch { this.display.value = 'Error'; }
                    },
                    'percent': () => {
                        try {
                            const result = new Function('return ' + this.display.value)() / 100;
                            this.display.value = result.toString();
                        } catch { this.display.value = 'Error'; }
                    },
                    'mc': () => { this.memory = 0; },
                    'mr': () => this.appendToDisplay(this.memory.toString()),
                    'ms': () => { 
                        try {
                            this.memory = new Function('return ' + this.display.value || '0')();
                        } catch { this.memory = 0; }
                    },
                    'm+': () => { 
                        try {
                            this.memory += new Function('return ' + this.display.value || '0')();
                        } catch { /* ignore */ }
                    },
                    'm-': () => { 
                        try {
                            this.memory -= new Function('return ' + this.display.value || '0')();
                        } catch { /* ignore */ }
                    },
                };
                if (functions[func]) functions[func]();
            },

            toggleSecondFunctions() {
                this.isSecond = !this.isSecond;
                document.querySelectorAll('[data-main]').forEach(btn => {
                    const mainFunc = btn.dataset.main;
                    const secondFunc = btn.dataset.second;
                    const mainLabel = btn.dataset.mainLabel;
                    const secondLabel = btn.dataset.secondLabel;
                    
                    btn.dataset.function = this.isSecond ? secondFunc : mainFunc;
                    btn.innerHTML = this.isSecond ? secondLabel : mainLabel;
                });
                
                // Update 2nd button appearance
                const secondBtn = document.querySelector('[data-function="2nd"]');
                secondBtn.style.background = this.isSecond ? '#00aaff' : '';
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
                document.getElementById('function-input').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.plot();
                });
                
                this.chart = new Chart(ctx, {
                    type: 'line',
                    data: { 
                        labels: [], 
                        datasets: [{ 
                            label: 'f(x)', 
                            data: [], 
                            borderColor: '#00aaff',
                            backgroundColor: 'rgba(0, 170, 255, 0.1)',
                            tension: 0.1,
                            pointRadius: 0
                        }] 
                    },
                    options: { 
                        responsive: true,
                        scales: { 
                            x: { 
                                type: 'linear',
                                position: 'bottom',
                                ticks: { color: '#888' }
                            }, 
                            y: { 
                                ticks: { color: '#888' }
                            } 
                        },
                        plugins: {
                            legend: {
                                labels: { color: '#888' }
                            }
                        }
                    }
                });
            },

            plot() {
                const funcStr = document.getElementById('function-input').value;
                if (!funcStr) return;
                
                try {
                    const func = new Function('x', 'return ' + funcStr);
                    const data = [];
                    
                    for (let x = -10; x <= 10; x += 0.1) {
                        const y = func(x);
                        if (isFinite(y)) {
                            data.push({ x: x, y: y });
                        }
                    }
                    
                    this.chart.data.datasets[0].data = data;
                    this.chart.data.datasets[0].label = `f(x) = ${funcStr}`;
                    this.chart.update();
                } catch (error) { 
                    alert('Invalid function: ' + error.message); 
                }
            }
        },

        // --- CONVERTER ---
        converter: {
            units: {
                length: { 
                    m: 1, 
                    km: 1000, 
                    cm: 0.01, 
                    mm: 0.001, 
                    mi: 1609.34, 
                    ft: 0.3048, 
                    in: 0.0254,
                    yd: 0.9144
                },
                mass: { 
                    g: 1, 
                    kg: 1000, 
                    mg: 0.001, 
                    lb: 453.592, 
                    oz: 28.35,
                    ton: 1000000
                },
                temperature: { c: 1, f: 1, k: 1 }, // Special handling
                speed: { 
                    'm/s': 1, 
                    'km/h': 0.277778, 
                    'mph': 0.44704,
                    'ft/s': 0.3048,
                    'knot': 0.514444
                }
            },

            init() {
                const categorySelect = document.getElementById('category-select');
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
                    let celsius = input;
                    if (from === 'f') celsius = (input - 32) * 5 / 9;
                    if (from === 'k') celsius = input - 273.15;
                    
                    if (to === 'f') result = (celsius * 9 / 5) + 32;
                    else if (to === 'k') result = celsius + 273.15;
                    else result = celsius;
                } else {
                    const baseValue = input * this.units[category][from];
                    result = baseValue / this.units[category][to];
                }
                
                document.getElementById('unit-output').value = result.toFixed(6);
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