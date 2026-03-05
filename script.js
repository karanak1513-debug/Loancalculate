document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const loanAmountInput = document.getElementById('loan-amount');
    const interestRateInput = document.getElementById('interest-rate');
    const loanTenureInput = document.getElementById('loan-tenure');

    const loanAmountSlider = document.getElementById('loan-slider');
    const interestRateSlider = document.getElementById('interest-slider');
    const loanTenureSlider = document.getElementById('tenure-slider');

    const monthlyEmiDisplay = document.getElementById('monthly-emi');
    const principalAmountDisplay = document.getElementById('principal-amount');
    const totalInterestDisplay = document.getElementById('total-interest');
    const totalPaymentDisplay = document.getElementById('total-payment');

    const emiChartCanvas = document.getElementById('emiChart');
    let emiChart;

    // Formatting Function (INR)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Calculate EMI Logic
    const calculateEMI = () => {
        let p = parseFloat(loanAmountInput.value);
        let r = parseFloat(interestRateInput.value);
        let n = parseFloat(loanTenureInput.value);

        if (isNaN(p) || p <= 0) p = 0;
        if (isNaN(r) || r < 0) r = 0;
        if (isNaN(n) || n <= 0) n = 1;

        // r = Monthly Interest Rate
        let monthlyRate = r / 12 / 100;
        // n = Number of Months
        let months = n * 12;

        let emi = 0;
        let totalAmount = 0;
        let totalInterest = 0;

        if (monthlyRate === 0) {
            emi = p / months;
            totalAmount = p;
            totalInterest = 0;
        } else {
            emi = p * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
            totalAmount = emi * months;
            totalInterest = totalAmount - p;
        }

        if (p === 0) {
            emi = 0;
            totalAmount = 0;
            totalInterest = 0;
        }

        // Update DOM
        monthlyEmiDisplay.innerText = formatCurrency(Math.round(emi));
        principalAmountDisplay.innerText = formatCurrency(Math.round(p));
        totalInterestDisplay.innerText = formatCurrency(Math.round(totalInterest));
        totalPaymentDisplay.innerText = formatCurrency(Math.round(totalAmount));

        // Update Chart
        updateChart(p, totalInterest);
    };

    // Chart logic
    const updateChart = (principal, interest) => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const textColor = isDarkMode ? '#F0F0F0' : '#333333';

        if (emiChart) {
            emiChart.data.datasets[0].data = [principal, interest];
            emiChart.options.plugins.legend.labels.color = textColor;
            emiChart.update();
        } else {
            const ctx = emiChartCanvas.getContext('2d');
            emiChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Principal Amount', 'Total Interest'],
                    datasets: [{
                        data: [principal, interest],
                        backgroundColor: ['#3C91E6', '#0A3D62'],
                        hoverBackgroundColor: ['#5DAFF2', '#1452A3'],
                        borderWidth: 0,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: textColor,
                                font: {
                                    family: "'Poppins', sans-serif"
                                },
                                padding: 20
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed !== null) {
                                        label += formatCurrency(context.parsed);
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        }
    };

    // Sync input and slider logic
    const syncControls = (inputEl, sliderEl) => {
        inputEl.addEventListener('input', (e) => {
            let val = parseFloat(inputEl.value);
            let max = parseFloat(inputEl.max);
            
            // Allow temporary empty or incomplete typing
            if(isNaN(val)) return;

            if (val > max) val = max;
            sliderEl.value = val;
            calculateEMI();
        });

        inputEl.addEventListener('change', (e) => {
            let val = parseFloat(inputEl.value);
            let min = parseFloat(inputEl.min);
            let max = parseFloat(inputEl.max);
            
            if (isNaN(val) || val < min) {
                val = min;
            } else if (val > max) {
                val = max;
            }

            inputEl.value = val;
            sliderEl.value = val;
            calculateEMI();
        });

        sliderEl.addEventListener('input', (e) => {
            inputEl.value = sliderEl.value;
            calculateEMI();
        });
    };

    syncControls(loanAmountInput, loanAmountSlider);
    syncControls(interestRateInput, interestRateSlider);
    syncControls(loanTenureInput, loanTenureSlider);

    // Initial Calculation
    calculateEMI();

    // Dark Mode Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const checkTheme = () => {
        if (localStorage.getItem('smartFinanceTheme') === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    };
    
    checkTheme();

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        
        if (isDark) {
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('smartFinanceTheme', 'dark');
        } else {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('smartFinanceTheme', 'light');
        }
        
        // Re-render chart for text color update
        calculateEMI();
    });

    // Loan Category Cards
    const categoryCards = document.querySelectorAll('.category-card');
    const categoryDefaults = {
        home: { amount: 5000000, rate: 8.5, tenure: 20 },
        car: { amount: 800000, rate: 8.8, tenure: 5 },
        personal: { amount: 500000, rate: 10.5, tenure: 3 },
        education: { amount: 1500000, rate: 9.0, tenure: 7 },
        business: { amount: 2000000, rate: 11.2, tenure: 5 }
    };

    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active classes
            categoryCards.forEach(c => c.style.borderColor = 'transparent');
            
            // Add active class
            card.style.borderColor = 'var(--secondary-color)';
            
            const type = card.getAttribute('data-loan');
            const data = categoryDefaults[type];
            
            if(data) {
                loanAmountInput.value = data.amount;
                loanAmountSlider.value = data.amount;
                
                interestRateInput.value = data.rate;
                interestRateSlider.value = data.rate;
                
                loanTenureInput.value = data.tenure;
                loanTenureSlider.value = data.tenure;
                
                calculateEMI();
                
                // Scroll to calculator smoothly
                document.getElementById('calculator').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            faqItems.forEach(faq => {
                faq.classList.remove('active');
            });
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Dummy download schedule
    const downloadBtn = document.getElementById('download-schedule');
    if(downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            alert("This feature will generate a detailed PDF EMI schedule based on your inputs. Coming soon!");
        });
    }

    // Scroll Navbar Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if(window.scrollY > 50) {
            navbar.style.padding = '10px 5%';
            navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.padding = '15px 5%';
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
    });

    // Mobile Hamburger
    const hamburger = document.querySelector('.hamburger');
    hamburger.addEventListener('click', () => {
        const navLinks = document.querySelector('.nav-links');
        const actionsMobile = document.querySelector('.nav-actions');
        
        if (navLinks.classList.contains('active-mobile')) {
            navLinks.style.display = 'none';
            navLinks.classList.remove('active-mobile');
        } else {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'var(--surface-color)';
            navLinks.style.padding = '20px';
            navLinks.style.boxShadow = 'var(--shadow)';
            navLinks.classList.add('active-mobile');
        }
    });
});
