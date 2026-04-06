/**
 * MECÂNICA BMI - APP SCRIPT
 * Lógica para interatividade do portal oficial
 */

/* ==============================================================
   MECÂNICA BMI - APP ENGINE
   Desenvolvido por Oliveira Strategic
   ============================================================== */
document.addEventListener('DOMContentLoaded', () => {

    // CONFIGURAÇÕES EXTERNAS
    const WEBHOOKS = {
        pagamento: "https://discordapp.com/api/webhooks/1487676588438065203/yW5ZFZvC-zZp_3Bjvxim3V3jpYPxs3NpgW0UJ5bqCbtdhO-U8HVVca0A0Ns5h5qYGdf-",
        horas: "https://discordapp.com/api/webhooks/1487987170089107558/qkLHXSb3vaRfiR74wSg6gkUr882gqTjYVvEfrDn27heDnhvzwjbv66XdFXMDMFIQQXXv",
        cargo: "https://discordapp.com/api/webhooks/1487694906326777918/oddww0-WkogVL_fmx7rTgfsfiq0LKOxQj2XhnXRFZb8FCsBqJeewPQQiyYVasZNCygOn"
    };

    const CLOUDINARY_CLOUD_NAME = "dci9bcb1u";
    const CLOUDINARY_UPLOAD_PRESET = "mecanica";

    async function uploadToCloudinary(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok || !data.secure_url) {
            console.error('Erro Cloudinary:', data);
            throw new Error('Falha ao enviar imagem para o Cloudinary.');
        }

        return data.secure_url;
    }

    // 1. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-nav a');

    if (mobileBtn && mobileNav) {
        mobileBtn.addEventListener('click', () => {
            const isOpen = mobileNav.classList.contains('open');
            if (isOpen) {
                mobileNav.classList.remove('open');
                mobileBtn.innerHTML = '<i class="ph ph-list"></i>';
            } else {
                mobileNav.classList.add('open');
                mobileBtn.innerHTML = '<i class="ph ph-x"></i>';
            }
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('open');
                mobileBtn.innerHTML = '<i class="ph ph-list"></i>';
            });
        });
    }

    // 2. Active Nav Link on Scroll
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // 3. Tab Switching in Serviços
    const tabBtns = document.querySelectorAll('.tab-btn');
    const formPanels = document.querySelectorAll('.form-panel:not(.form-success)');
    const successMsg = document.getElementById('form-success-msg');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            formPanels.forEach(p => p.classList.add('hidden'));
            
            if (successMsg) successMsg.classList.add('hidden');

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            const targetPanel = document.getElementById(targetId);
            
            if (targetPanel) {
                targetPanel.classList.remove('hidden');
                targetPanel.style.animation = 'none';
                targetPanel.offsetHeight;
                targetPanel.style.animation = 'fadeIn 0.5s ease forwards';
            }
        });
    });

    // 4. Form Submissions Logic & Validation
    const forms = document.querySelectorAll('.bmi-form');
    const btnVoltar = document.getElementById('btn-voltar-form');

    // ==============================================================
    // -- Lógica Customizada: Form 1 (Solicitar Pagamento) --
    // ==============================================================
    const pgtoCargo = document.getElementById('pagamento-cargo');
    const pgtoSalario = document.getElementById('pagamento-salario');
    if (pgtoCargo && pgtoSalario) {
        pgtoCargo.addEventListener('change', (e) => {
            const selectedOpt = e.target.options[e.target.selectedIndex];
            const salario = selectedOpt.getAttribute('data-salario');
            pgtoSalario.value = salario ? salario : '';
        });
    }

    // ==============================================================
    // -- Lógica Customizada: Form 2 (Compra de Horas) --
    // ==============================================================
    const horasInput = document.getElementById('horas-input');
    const horasTotal = document.getElementById('horas-total');
    const horasTotalHidden = document.getElementById('horas-total-hidden');
    if (horasInput && horasTotal) {
        horasInput.addEventListener('input', (e) => {
            const qtd = parseInt(e.target.value) || 0;
            const formatoPix = `R$ ${(qtd * 1.0).toFixed(2).replace('.', ',')}`;
            horasTotal.innerText = formatoPix;
            if (horasTotalHidden) horasTotalHidden.value = formatoPix;
        });

        if (horasInput.value) {
            const qtd = parseInt(horasInput.value) || 0;
            const formatoPix = `R$ ${(qtd * 1.0).toFixed(2).replace('.', ',')}`;
            horasTotal.innerText = formatoPix;
            if (horasTotalHidden) horasTotalHidden.value = formatoPix;
        }
    }

    // ==============================================================
    // -- Lógica Customizada: Form 3 (Compra de Cargo) --
    // ==============================================================
    const cargoSelect = document.getElementById('cargo-selecionado');
    const precoIg = document.getElementById('preco-ig');
    const precoPix = document.getElementById('preco-pix');
    const precoIgHidden = document.getElementById('preco-ig-hidden');
    const precoPixHidden = document.getElementById('preco-pix-hidden');
    
    const cupomInput = document.getElementById('cupom-cargo-input');
    const btnCupom = document.getElementById('btn-aplicar-cupom');
    const cupomMsg = document.getElementById('cupom-msg');
    let descActive = 0;

    if (btnCupom && cupomInput) {
        btnCupom.addEventListener('click', () => {
            const val = cupomInput.value.trim().toUpperCase();
            if (val === 'MECPASCOA30') {
                descActive = 0.30;
                cupomMsg.innerText = '🐰 Cupom de 30% Aplicado com Sucesso!';
                cupomMsg.style.color = '#10B981';
            } else if (val !== '') {
                descActive = 0;
                cupomMsg.innerText = '❌ Cupom inválido ou expirado.';
                cupomMsg.style.color = '#ff3333';
            }
            updateCargoCalc();
        });
    }

    function updateCargoCalc() {
        if (!cargoSelect) return;
        const opt = cargoSelect.options[cargoSelect.selectedIndex];
        if (!opt || opt.disabled) return;
        
        let baseIg = parseFloat(opt.getAttribute('data-ig').replace(/\./g, ''));
        let basePix = parseFloat(opt.getAttribute('data-pix'));
        
        if (descActive > 0) {
            basePix = basePix - (basePix * descActive);
            baseIg = baseIg - (baseIg * descActive);
        }
        
        const fmtPix = `R$ ${basePix.toFixed(2).replace('.', ',')}`;
        const fmtIg = `$ ` + baseIg.toLocaleString('pt-BR');

        precoPix.innerText = fmtPix;
        precoIg.innerText = fmtIg;
        if (precoPixHidden) precoPixHidden.value = fmtPix;
        if (precoIgHidden) precoIgHidden.value = fmtIg;
    }

    if (cargoSelect) {
        cargoSelect.addEventListener('change', updateCargoCalc);
        if (cargoSelect.value) {
            updateCargoCalc();
        }
    }

    // ==============================================================
    // -- Lógica de Toggles Dinâmicos de Pagamento (Forms 2 e 3) --
    // ==============================================================
    
    function setupPaymentToggles(formPrefix) {
        const metodoSelect = document.getElementById(`${formPrefix}-pagamento-metodo`);
        const uiPix = document.getElementById(`${formPrefix}-pix-ui`);
        const uiIg = document.getElementById(`${formPrefix}-ig-ui`);
        const compPix = document.getElementById(`${formPrefix}-comprovante-pix`);
        const compIg = document.getElementById(`${formPrefix}-comprovante-ig`);
        
        const opcaoPixSelect = document.getElementById(`${formPrefix}-opcao-pix`);
        const divCopiaCola = document.getElementById(`${formPrefix}-pix-copia`);
        const divQRCode = document.getElementById(`${formPrefix}-pix-qrcode`);

        if (metodoSelect) {
            metodoSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val === 'PIX') {
                    if (uiPix) uiPix.classList.remove('hidden');
                    if (uiIg) uiIg.classList.add('hidden');
                    
                    if (opcaoPixSelect) opcaoPixSelect.removeAttribute('disabled');
                    if (compPix) compPix.setAttribute('required', 'true');
                    if (compIg) compIg.removeAttribute('required');
                } else if (val === 'IN_GAME') {
                    if (uiIg) uiIg.classList.remove('hidden');
                    if (uiPix) uiPix.classList.add('hidden');
                    
                    if (opcaoPixSelect) opcaoPixSelect.setAttribute('disabled', 'true');
                    if (compIg) compIg.setAttribute('required', 'true');
                    if (compPix) compPix.removeAttribute('required');
                    
                    if (divCopiaCola) divCopiaCola.classList.add('hidden');
                    if (divQRCode) divQRCode.classList.add('hidden');
                    if (opcaoPixSelect) opcaoPixSelect.value = "";
                }
            });
        }
        
        if (opcaoPixSelect) {
            opcaoPixSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val === 'COPIA_COLA') {
                    if (divCopiaCola) divCopiaCola.classList.remove('hidden');
                    if (divQRCode) divQRCode.classList.add('hidden');
                } else if (val === 'QR_CODE') {
                    if (divQRCode) divQRCode.classList.remove('hidden');
                    if (divCopiaCola) divCopiaCola.classList.add('hidden');
                }
            });
        }
    }

    setupPaymentToggles('horas');
    setupPaymentToggles('cargo');

    document.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
            e.target.style.borderColor = '';
            const errorSpan = e.target.nextElementSibling;
            if (errorSpan && errorSpan.classList.contains('error-msg')) {
                errorSpan.remove();
            }
        }
    });

    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            let isValid = true;
            const elements = form.querySelectorAll('input[required], select[required]');
            
            elements.forEach(el => {
                const prevError = el.nextElementSibling;
                if (prevError && prevError.classList.contains('error-msg')) {
                    prevError.remove();
                }

                if (!el.value.trim()) {
                    isValid = false;
                    el.style.borderColor = '#ff3333';
                    
                    const errorSpan = document.createElement('span');
                    errorSpan.className = 'error-msg';
                    errorSpan.style.color = '#ff3333';
                    errorSpan.style.fontSize = '0.85rem';
                    errorSpan.style.marginTop = '6px';
                    errorSpan.style.display = 'block';
                    errorSpan.innerText = '⚠️ Este campo é obrigatório para o envio.';
                    
                    el.parentNode.insertBefore(errorSpan, el.nextSibling);
                } else if (el.type === 'url' && !el.value.startsWith('http')) {
                    isValid = false;
                    el.style.borderColor = '#ff3333';
                    const errorSpan = document.createElement('span');
                    errorSpan.className = 'error-msg';
                    errorSpan.style.color = '#ff3333';
                    errorSpan.style.fontSize = '0.85rem';
                    errorSpan.style.marginTop = '6px';
                    errorSpan.style.display = 'block';
                    errorSpan.innerText = '⚠️ A URL informada deve ser válida (iniciar com http ou https).';
                    el.parentNode.insertBefore(errorSpan, el.nextSibling);
                }
            });

            if (!isValid) return;

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="ph ph-spinner-gap" style="animation: spin 1s infinite linear;"></i> Processando...';
            submitBtn.disabled = true;

            try {
                let fieldsPayload = [];
                const formData = new FormData(form);
                let tipo = form.querySelector('input[name="Tipo"]')?.value || "Novo Protocolo BMI";

                let webhookUrl = WEBHOOKS.pagamento;

                if (tipo.toLowerCase().includes("pagamento")) {
                    webhookUrl = WEBHOOKS.pagamento;
                    tipo = "💰 Solicitação de Pagamento";
                } else if (tipo.toLowerCase().includes("horas")) {
                    webhookUrl = WEBHOOKS.horas;
                    tipo = "⏱️ Compra de Horas";
                } else if (tipo.toLowerCase().includes("cargo")) {
                    webhookUrl = WEBHOOKS.cargo;
                    tipo = "🧾 Compra de Cargo";
                }

                const fileInputs = form.querySelectorAll('input[type="file"]');
                const uploadedFileUrls = [];

                for (const fileInput of fileInputs) {
                    if (fileInput.files.length > 0) {
                        const file = fileInput.files[0];
                        const fileUrl = await uploadToCloudinary(file);
                        uploadedFileUrls.push({
                            nomeCampo: fileInput.getAttribute('name') || 'Comprovante',
                            nomeArquivo: file.name,
                            url: fileUrl
                        });
                    }
                }

                for (let [key, value] of formData.entries()) {
                    if (key === "Tipo") continue;

                    if (!(value instanceof File) && String(value).trim() !== '') {
                        fieldsPayload.push({
                            name: key.replace(/_/g, ' '),
                            value: String(value),
                            inline: true
                        });
                    }
                }

                uploadedFileUrls.forEach(fileData => {
                    fieldsPayload.push({
                        name: `📎 ${fileData.nomeCampo.replace(/_/g, ' ')}`,
                        value: `[Abrir comprovante](${fileData.url})`,
                        inline: false
                    });
                });

                const embedObj = {
                    title: tipo,
                    color: 16739072,
                    fields: fieldsPayload,
                    footer: { text: "Sistema Corporativo BMI • Desenvolvido por Oliveira Strategic" },
                    timestamp: new Date().toISOString()
                };

                if (uploadedFileUrls.length > 0) {
                    embedObj.image = {
                        url: uploadedFileUrls[0].url
                    };
                }

                const discordPayload = {
                    username: "Central de Serviços BMI",
                    embeds: [embedObj]
                };

                if (
                    webhookUrl.includes("SEU_WEBHOOK") ||
                    CLOUDINARY_CLOUD_NAME.includes("SEU_CLOUD") ||
                    CLOUDINARY_UPLOAD_PRESET.includes("SEU_UPLOAD")
                ) {
                    setTimeout(() => { handleSuccess(); }, 1500);
                } else {
                    const response = await fetch(webhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(discordPayload)
                    });
                    
                    if (response.ok) {
                        handleSuccess();
                    } else {
                        throw new Error('Falha de Conexão Discord');
                    }
                }
            } catch (error) {
                console.error(error);
                alert('⚠️ Erro ao enviar para o Discord ou para o Cloudinary. Verifique os 3 webhooks, Cloud Name e Upload Preset.');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }

            function handleSuccess() {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                formPanels.forEach(p => p.classList.add('hidden'));
                
                if (successMsg) {
                    successMsg.classList.remove('hidden');
                    successMsg.style.animation = 'none';
                    successMsg.offsetHeight; 
                    successMsg.style.animation = 'fadeIn 0.5s ease forwards';
                }
                
                form.reset();

                if (horasTotal) horasTotal.innerText = 'R$ 0,00';
                if (horasTotalHidden) horasTotalHidden.value = '';
                if (precoPix) precoPix.innerText = 'R$ 0,00';
                if (precoIg) precoIg.innerText = '$ 0';
                if (precoPixHidden) precoPixHidden.value = '';
                if (precoIgHidden) precoIgHidden.value = '';
                if (cupomMsg) cupomMsg.innerText = '';
                descActive = 0;
            }
        });
    });

    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => {
            successMsg.classList.add('hidden');
            if (tabBtns.length > 0) {
                const firstTabId = tabBtns[0].getAttribute('data-tab');
                const firstPanel = document.getElementById(firstTabId);
                
                if (firstPanel) {
                    firstPanel.classList.remove('hidden');
                    firstPanel.style.animation = 'none';
                    firstPanel.offsetHeight;
                    firstPanel.style.animation = 'fadeIn 0.5s ease forwards';
                }
                
                tabBtns.forEach(b => b.classList.remove('active'));
                tabBtns[0].classList.add('active');
            }
        });
    }

    if (!document.getElementById('spin-keyframes')) {
        const style = document.createElement('style');
        style.id = 'spin-keyframes';
        style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
        document.head.appendChild(style);
    }

    // 5. FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

});