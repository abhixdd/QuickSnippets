const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('add-snippet');
    const snippetList = document.getElementById('snippet-list');
    const snippetInput = document.getElementById('snippet-input');

    if (addButton) {
        addButton.addEventListener('click', async (event) => {
            event.preventDefault();
            const snippetText = snippetInput.value.trim();

            if (snippetText) {
                try {
                    await ipcRenderer.invoke('add-snippet', { text: snippetText });
                    snippetInput.value = ''; 
                    loadSnippets(); 
                } catch (error) {
                    console.error('Error adding snippet:', error);
                }
            }
        });
    }

    async function loadSnippets() {
        try {
            const snippets = await ipcRenderer.invoke('get-snippets');
            if (snippetList) {
                snippetList.innerHTML = ''; 
                snippets.forEach(snippet => {
                    const listItem = document.createElement('li');
                    const snippetText = document.createElement('span');
                    const copyButton = document.createElement('button');
                    const copyIcon = document.createElement('img');
                    const deleteButton = document.createElement('button');
                    const deleteIcon = document.createElement('img');

                    snippetText.textContent = snippet.text;
                    snippetText.className = 'snippet-text';

                    copyButton.className = 'copy-btn';
                    copyButton.setAttribute('data-snippet', snippet.text);

                    copyIcon.src = 'assets/copy-icon.png';
                    copyIcon.alt = 'Copy';
                    copyIcon.className = 'copy-icon';

                    copyButton.appendChild(copyIcon);

                    deleteButton.className = 'delete-btn';
                    deleteButton.setAttribute('data-id', snippet.id);

                    deleteIcon.src = 'assets/delete-icon.png';
                    deleteIcon.alt = 'Delete';
                    deleteIcon.className = 'delete-icon';

                    deleteButton.appendChild(deleteIcon);

                   
                    listItem.appendChild(snippetText);
                    listItem.appendChild(copyButton);
                    listItem.appendChild(deleteButton);

                    snippetList.appendChild(listItem);

                   
                    copyButton.addEventListener('click', (event) => {
                        const textToCopy = event.target.closest('.copy-btn').getAttribute('data-snippet');
                        copyToClipboard(textToCopy);
                    });

                  
                    deleteButton.addEventListener('click', async (event) => {
                        const snippetId = event.target.closest('.delete-btn').getAttribute('data-id');
                        try {
                            await ipcRenderer.invoke('delete-snippet', { id: snippetId });
                            loadSnippets(); // Reload snippets list after deletion
                        } catch (error) {
                            console.error('Error deleting snippet:', error);
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Error loading snippets:', error);
        }
    }

    function copyToClipboard(text) {
        try {
            // Create a temporary textarea element
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = text;
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextArea);

            alert('Snippet copied to clipboard!');

          
           setTimeout(() => {
            const inputField = document.querySelector('#snippet-input');
            inputField.focus();
            }, 2000);
            
            
            snippetInput.focus();
        } catch (err) {
            console.error('Failed to copy snippet: ', err);
            alert('Failed to copy snippet. Please try again.');
        }
    }

    
    loadSnippets();
});
