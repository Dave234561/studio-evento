// Script pour gérer le chat des modules intégrés
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let chatMessages = document.getElementById('roiChatMessages');
    let eventDescription = document.getElementById('eventDescription');
    let isProcessing = false;
    
    // Initialiser le module courant
    window.currentModule = window.currentModule || 'analyse-roi';
    
    // Fonction pour envoyer un message à l'agent
    window.sendMessage = async function(message) {
        if (!message || isProcessing) return;
        
        // Afficher le message de l'utilisateur
        appendUserMessage(message);
        
        // Effacer le champ de saisie
        if (eventDescription) {
            eventDescription.value = '';
        }
        
        // Afficher l'indicateur de chargement
        appendLoadingMessage();
        
        // Marquer comme en cours de traitement
        isProcessing = true;
        
        try {
            // Envoyer la requête à l'API
            const response = await fetch(`/api/modules/${window.currentModule}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    context: {
                        source: 'studio-evento-integrated',
                        interface: 'unified'
                    }
                })
            });
            
            // Traiter la réponse
            const data = await response.json();
            
            // Supprimer l'indicateur de chargement
            removeLoadingMessage();
            
            // Afficher la réponse de l'agent
            if (data.success) {
                // Gérer les différents types de réponses selon le module
                let content = '';
                
                if (window.currentModule === 'visual-identity' && data.data) {
                    // Réponse spéciale pour l'agent d'identité visuelle
                    content = formatVisualIdentityResponse(data.data);
                } else if (data.response && data.response.content) {
                    // Réponse standard des autres agents
                    content = data.response.content;
                } else if (data.content) {
                    // Réponse alternative
                    content = data.content;
                } else {
                    // Fallback
                    content = JSON.stringify(data, null, 2);
                }
                
                appendAgentMessage(content, getAgentNameFromModule(window.currentModule));
            } else {
                appendAgentMessage(`Désolé, une erreur s'est produite : ${data.error}`, getAgentNameFromModule(window.currentModule));
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            removeLoadingMessage();
            appendAgentMessage('Désolé, une erreur de communication s\'est produite. Veuillez réessayer.', getAgentNameFromModule(window.currentModule));
        }
        
        // Marquer comme traitement terminé
        isProcessing = false;
    };
    
    // Fonction pour utiliser un exemple
    window.sendExample = function(example) {
        sendMessage(example);
    };
    
    // Fonction pour utiliser le template
    window.useTemplate = function() {
        const template = `Type d'événement : Séminaire
Nombre de participants : 80 personnes
Lieu souhaité : Lyon
Budget approximatif : 25k€
Objectifs spécifiques : Formation commerciale, team building`;
        
        if (eventDescription) {
            eventDescription.value = template;
        }
    };
    
    // Fonction pour analyser avec l'IA
    window.analyzeWithAI = function() {
        if (eventDescription && eventDescription.value.trim()) {
            sendMessage(eventDescription.value);
        } else {
            alert('Veuillez d\'abord décrire votre événement ou utiliser le template.');
        }
    };
    
    // Fonction pour ajouter un message utilisateur
    function appendUserMessage(message) {
        if (!chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message user';
        messageElement.style.cssText = 'margin-bottom: 15px; padding: 15px; background: #e3f2fd; border-radius: 10px; border-top-right-radius: 0; max-width: 80%; margin-left: auto;';
        
        const messageHeader = document.createElement('div');
        messageHeader.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 5px;';
        messageHeader.innerHTML = `
            <span style="font-weight: bold;">Vous</span>
            <span style="color: #666; font-size: 0.8rem;">${getCurrentTime()}</span>
        `;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = message;
        
        messageElement.appendChild(messageHeader);
        messageElement.appendChild(messageContent);
        
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }
    
    // Fonction pour ajouter un message de l'agent
    function appendAgentMessage(message, agentName) {
        if (!chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message agent';
        messageElement.style.cssText = 'margin-bottom: 15px; padding: 15px; background: #e8f5e8; border-radius: 10px; border-top-left-radius: 0; max-width: 80%;';
        
        const messageHeader = document.createElement('div');
        messageHeader.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 5px;';
        messageHeader.innerHTML = `
            <span style="font-weight: bold;">Agent ${agentName}</span>
            <span style="color: #666; font-size: 0.8rem;">${getCurrentTime()}</span>
        `;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = message;
        
        messageElement.appendChild(messageHeader);
        messageElement.appendChild(messageContent);
        
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }
    
    // Fonction pour ajouter un indicateur de chargement
    function appendLoadingMessage() {
        if (!chatMessages) return;
        
        const loadingElement = document.createElement('div');
        loadingElement.id = 'loadingMessage';
        loadingElement.className = 'message agent';
        loadingElement.style.cssText = 'margin-bottom: 15px; padding: 15px; background: #e8f5e8; border-radius: 10px; border-top-left-radius: 0; max-width: 80%;';
        
        loadingElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div class="spinner"></div>
                <span>L'agent réfléchit...</span>
            </div>
        `;
        
        chatMessages.appendChild(loadingElement);
        scrollToBottom();
    }
    
    // Fonction pour supprimer l'indicateur de chargement
    function removeLoadingMessage() {
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }
    
    // Fonction pour faire défiler vers le bas
    function scrollToBottom() {
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // Fonction pour obtenir l'heure actuelle
    function getCurrentTime() {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Fonction pour obtenir le nom de l'agent à partir du module
    function getAgentNameFromModule(module) {
        const moduleNames = {
            'synthese-brief': 'Brief',
            'gestion-risques': 'Risques', 
            'recherche-lieux': 'Lieux',
            'recherche-animations': 'Animations',
            'conception-creative': 'Concept',
            'design-evenement': 'Design',
            'empreinte-carbone': 'Carbone',
            'analyse-roi': 'ROI',
            'gestion-budget': 'Budget'
        };
        return moduleNames[module] || 'IA';
    }
    
    // Ajouter le style pour le spinner
    const style = document.createElement('style');
    style.textContent = `
        .spinner {
            width: 20px;
            height: 20px;
            border: 3px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top-color: #4CAF50;
            animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
});



    // Fonction pour formater les réponses de l'agent d'identité visuelle
    function formatVisualIdentityResponse(data) {
        if (!data.proposals || data.proposals.length === 0) {
            return "Aucune proposition visuelle générée.";
        }
        
        let html = `<div class="visual-identity-response">
            <h3>🎨 Propositions Visuelles Générées</h3>
            <p>Voici ${data.proposals.length} propositions visuelles pour votre événement :</p>
        `;
        
        data.proposals.forEach((proposal, index) => {
            const proposalNumber = index + 1;
            const hasError = proposal.id.includes('_error');
            
            html += `<div class="visual-proposal" style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                <h4>Proposition ${proposalNumber}</h4>
            `;
            
            if (hasError) {
                html += `<div style="color: #d32f2f; background: #ffebee; padding: 10px; border-radius: 4px; margin: 10px 0;">
                    ⚠️ Erreur lors de la génération : ${proposal.metadata.parameters?.error || 'Erreur inconnue'}
                </div>`;
            } else if (proposal.imageUrl) {
                html += `<img src="${proposal.imageUrl}" alt="Proposition ${proposalNumber}" style="max-width: 100%; height: auto; border-radius: 4px; margin: 10px 0;">`;
                
                if (proposal.downloadUrls && proposal.downloadUrls.original) {
                    html += `<div style="margin: 10px 0;">
                        <a href="${proposal.downloadUrls.original}" download="studio-evento-visual-${proposalNumber}.png" 
                           style="background: #4CAF50; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block;">
                            📥 Télécharger en haute résolution
                        </a>
                    </div>`;
                }
            }
            
            if (proposal.description) {
                html += `<p><strong>Description :</strong> ${proposal.description}</p>`;
            }
            
            if (proposal.metadata && proposal.metadata.processingTime) {
                html += `<p style="font-size: 0.9em; color: #666;">
                    ⏱️ Temps de génération : ${proposal.metadata.processingTime}ms
                </p>`;
            }
            
            html += `</div>`;
        });
        
        if (data.metadata && data.metadata.totalProcessingTime) {
            html += `<div style="margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
                <p><strong>Temps total de traitement :</strong> ${data.metadata.totalProcessingTime}ms</p>
                <p><strong>ID de requête :</strong> ${data.metadata.requestId}</p>
            </div>`;
        }
        
        html += `</div>`;
        
        return html;
    }

