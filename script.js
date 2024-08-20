document.addEventListener('DOMContentLoaded', () => {
	const unlockForm = document.getElementById('unlockForm');
	const fileInput = document.getElementById('pdfFile');
	const passwordInput = document.getElementById('password');
	const resultDiv = document.getElementById('result');
	const togglePasswordButton = document.getElementById('togglePassword');

	togglePasswordButton.addEventListener('click', () => {
		const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
		passwordInput.setAttribute('type', type);
		togglePasswordButton.querySelector('i').classList.toggle('fa-eye');
		togglePasswordButton.querySelector('i').classList.toggle('fa-eye-slash');
	});

	unlockForm.addEventListener('submit', async (e) => {
		e.preventDefault();

		const file = fileInput.files[0];
		const password = passwordInput.value;

		if (!file || !password) {
			resultDiv.textContent = 'Por favor, selecione um arquivo PDF e insira a senha.';
			resultDiv.className = 'error';
			return;
		}

		const formData = new FormData();
		formData.append('file', file);
		formData.append('data', password);

		try {
			resultDiv.textContent = 'Processando...';
			resultDiv.className = '';

			const response = await axios.post('https://api-pdf-unlock.onrender.com/unlock', formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				},
				responseType: 'blob'
			});

			const blob = new Blob([response.data], { type: 'application/pdf' });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'unlocked_' + file.name;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			resultDiv.textContent = 'PDF desbloqueado com sucesso! O download deve começar automaticamente.';
			resultDiv.className = 'success';
		} catch (error) {
			if (error.response) {
				resultDiv.textContent = `Erro ao desbloquear o PDF: ${error.response.data.message || 'Tente novamente.'}`;
			} else if (error.request) {
				resultDiv.textContent = 'Erro ao conectar com o servidor. Verifique sua conexão.';
			} else {
				resultDiv.textContent = `Erro: ${error.message}`;
			}
			resultDiv.className = 'error';
		}
	});
});