document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const recruiterTable = document.getElementById('recruiterTableBody');
    const statusMessage = document.getElementById('statusMessage');
    const pendingCount = document.getElementById('pendingCount');
    const sentCount = document.getElementById('sentCount');
    const failedCount = document.getElementById('failedCount');
    const sendEmailsBtn = document.getElementById('sendEmails');
    const sendTestBtn = document.getElementById('sendTest');
    const refreshBtn = document.getElementById('refresh');
    const testEmailModal = document.getElementById('testEmailModal');
    const closeModalBtn = document.getElementById('closeModal');
    const sendTestEmailBtn = document.getElementById('sendTestEmailBtn');
    const testEmailInput = document.getElementById('testEmail');

    // State
    let isProcessing = false;

    // Functions
    const updateStats = (data) => {
        const stats = data.reduce((acc, row) => {
            acc[row.Status] = (acc[row.Status] || 0) + 1;
            return acc;
        }, {});

        pendingCount.textContent = stats.Pending || 0;
        sentCount.textContent = stats.Sent || 0;
        failedCount.textContent = stats.Failed || 0;
    };

    const renderTable = (data) => {
        recruiterTable.innerHTML = data.map(row => `
            <tr>
                <td>${row.Name}</td>
                <td>${row.Email}</td>
                <td>${row.ReachOutCount}</td>
                <td><span class="status-badge status-${row.Status.toLowerCase()}">${row.Status}</span></td>
                <td>${row.LastContactDate || '-'}</td>
            </tr>
        `).join('');
    };

    const fetchData = async () => {
        try {
            const response = await fetch('/api/emails/status');
            const data = await response.json();
            renderTable(data);
            updateStats(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            statusMessage.textContent = 'Error fetching data';
            statusMessage.style.backgroundColor = '#fee2e2';
        }
    };

    const sendEmails = async () => {
        if (isProcessing) return;

        try {
            isProcessing = true;
            statusMessage.textContent = 'Sending emails...';
            statusMessage.style.backgroundColor = '#dbeafe';
            sendEmailsBtn.disabled = true;

            const response = await fetch('/api/emails/send', {
                method: 'POST'
            });
            const result = await response.json();

            if (result.success) {
                statusMessage.textContent = `Emails processed: ${result.details.sent} sent, ${result.details.failed} failed`;
                statusMessage.style.backgroundColor = '#dcfce7';
                await fetchData();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error sending emails:', error);
            statusMessage.textContent = 'Error sending emails';
            statusMessage.style.backgroundColor = '#fee2e2';
        } finally {
            isProcessing = false;
            sendEmailsBtn.disabled = false;
        }
    };

    const sendTestEmail = async (email) => {
        try {
            statusMessage.textContent = 'Sending test email...';
            statusMessage.style.backgroundColor = '#dbeafe';

            const response = await fetch('/api/emails/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            const result = await response.json();

            if (result.success) {
                statusMessage.textContent = 'Test email sent successfully';
                statusMessage.style.backgroundColor = '#dcfce7';
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error sending test email:', error);
            statusMessage.textContent = 'Error sending test email';
            statusMessage.style.backgroundColor = '#fee2e2';
        }
    };

    // Event Listeners
    sendEmailsBtn.addEventListener('click', sendEmails);
    refreshBtn.addEventListener('click', fetchData);
    
    sendTestBtn.addEventListener('click', () => {
        testEmailModal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => {
        testEmailModal.classList.remove('active');
        testEmailInput.value = '';
    });

    sendTestEmailBtn.addEventListener('click', () => {
        const email = testEmailInput.value.trim();
        if (email) {
            sendTestEmail(email);
            testEmailModal.classList.remove('active');
            testEmailInput.value = '';
        }
    });

    // Initial load
    fetchData();
});
