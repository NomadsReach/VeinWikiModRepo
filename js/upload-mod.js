/* jshint esversion: 11 */
/* globals console */

/**
 * API endpoint for mod submission
 * 
 * SECURITY NOTE: This endpoint should be a secure server-side proxy that:
 * - Validates and sanitizes all input
 * - Handles authentication and authorization
 * - Manages secure storage provider credentials (keys, tokens, etc.)
 * - Never exposes storage provider secrets to the client
 * 
 * Client-side validation is provided for UX only and can be bypassed.
 * All actual security must be enforced server-side.
 */
const API_ENDPOINT = '/api/submit-mod';

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024;
const MAX_SCREENSHOTS = 5;

let selectedScreenshots = [];

function initUploadForm() {
	const form = document.getElementById('modSubmissionForm');
	const modFileInput = document.getElementById('modFile');
	const screenshotsInput = document.getElementById('screenshots');
	const descriptionTextarea = document.getElementById('modDescription');
	const charCount = document.getElementById('descriptionCharCount');
	const submitBtn = document.getElementById('submitBtn');
	
	if (descriptionTextarea && charCount) {
		descriptionTextarea.addEventListener('input', function() {
			charCount.textContent = this.value.length;
		});
	}
	
	if (modFileInput) {
		modFileInput.addEventListener('change', function(e) {
			handleModFileSelect(e.target.files[0]);
		});
	}
	
	const fileRemove = document.getElementById('fileRemove');
	if (fileRemove) {
		fileRemove.addEventListener('click', function() {
			if (modFileInput) {
				modFileInput.value = '';
				document.getElementById('fileInfo').style.display = 'none';
			}
		});
	}
	
	if (screenshotsInput) {
		screenshotsInput.addEventListener('change', function(e) {
			handleScreenshotsSelect(e.target.files);
		});
	}
	
	if (form) {
		form.addEventListener('submit', handleFormSubmit);
	}
	
	setupDragAndDrop();
}

function handleModFileSelect(file) {
	if (!file) return;
	
	const fileInfo = document.getElementById('fileInfo');
	const fileName = document.getElementById('fileName');
	const fileSize = document.getElementById('fileSize');
	
	if (file.size > MAX_FILE_SIZE) {
		showError(`File size exceeds maximum of ${formatFileSize(MAX_FILE_SIZE)}`);
		return;
	}
	
	const validExtensions = ['.pak', '.zip', '.rar', '.7z'];
	const fileExt = '.' + file.name.split('.').pop().toLowerCase();
	if (!validExtensions.includes(fileExt)) {
		showError('Invalid file type. Please upload a .pak, .zip, .rar, or .7z file.');
		return;
	}
	
	if (fileName) fileName.textContent = file.name;
	if (fileSize) fileSize.textContent = formatFileSize(file.size);
	if (fileInfo) fileInfo.style.display = 'flex';
	
	hideError();
}

function rebuildScreenshotsPreview() {
	const preview = document.getElementById('screenshotsPreview');
	if (!preview) return;
	
	preview.innerHTML = '';
	
	if (selectedScreenshots.length === 0) {
		return;
	}
	
	selectedScreenshots.forEach((file, index) => {
		const reader = new FileReader();
		reader.onload = function(e) {
			const item = document.createElement('div');
			item.className = 'screenshot-preview-item';
			item.innerHTML = `
				<img src="${e.target.result}" alt="Preview ${index + 1}">
				<button type="button" class="remove-screenshot" data-index="${index}">
					<i class="fas fa-times"></i>
				</button>
			`;
			preview.appendChild(item);
			
			const removeBtn = item.querySelector('.remove-screenshot');
			if (removeBtn) {
				removeBtn.addEventListener('click', function() {
					removeScreenshot(index);
				});
			}
		};
		reader.readAsDataURL(file);
	});
}

function handleScreenshotsSelect(files) {
	if (!files || files.length === 0) {
		selectedScreenshots = [];
		document.getElementById('screenshotsPreview').innerHTML = '';
		return;
	}
	
	if (files.length > MAX_SCREENSHOTS) {
		showError(`Maximum ${MAX_SCREENSHOTS} screenshots allowed`);
		return;
	}
	
	selectedScreenshots = [];
	
	Array.from(files).forEach((file) => {
		if (file.size > MAX_SCREENSHOT_SIZE) {
			showError(`Screenshot "${file.name}" exceeds maximum size of ${formatFileSize(MAX_SCREENSHOT_SIZE)}`);
			return;
		}
		
		if (!file.type.startsWith('image/')) {
			showError(`File "${file.name}" is not a valid image`);
			return;
		}
		
		selectedScreenshots.push(file);
	});
	
	const screenshotsInput = document.getElementById('screenshots');
	if (screenshotsInput) {
		const dt = new DataTransfer();
		selectedScreenshots.forEach(file => dt.items.add(file));
		screenshotsInput.files = dt.files;
	}
	
	rebuildScreenshotsPreview();
	
	hideError();
}

function removeScreenshot(index) {
	const screenshotsInput = document.getElementById('screenshots');
	if (!screenshotsInput) return;
	
	if (index < 0 || index >= selectedScreenshots.length) {
		return;
	}
	
	selectedScreenshots.splice(index, 1);
	
	const dt = new DataTransfer();
	selectedScreenshots.forEach(file => dt.items.add(file));
	screenshotsInput.files = dt.files;
	
	rebuildScreenshotsPreview();
}

function setupDragAndDrop() {
	const fileUploadLabel = document.querySelector('.file-upload-label[for="modFile"]');
	const screenshotsLabel = document.querySelector('.file-upload-label[for="screenshots"]');
	
	[fileUploadLabel, screenshotsLabel].forEach(label => {
		if (!label) return;
		
		label.addEventListener('dragover', function(e) {
			e.preventDefault();
			e.stopPropagation();
			this.style.borderColor = 'var(--accent)';
			this.style.background = 'rgba(198, 61, 61, 0.1)';
		});
		
		label.addEventListener('dragleave', function(e) {
			e.preventDefault();
			e.stopPropagation();
			this.style.borderColor = 'var(--border)';
			this.style.background = 'var(--panel-2)';
		});
		
		label.addEventListener('drop', function(e) {
			e.preventDefault();
			e.stopPropagation();
			this.style.borderColor = 'var(--border)';
			this.style.background = 'var(--panel-2)';
			
			const files = e.dataTransfer.files;
			if (files.length > 0) {
				if (this.getAttribute('for') === 'modFile') {
					const modFileInput = document.getElementById('modFile');
					if (modFileInput) {
						const dt = new DataTransfer();
						dt.items.add(files[0]);
						modFileInput.files = dt.files;
						modFileInput.dispatchEvent(new Event('change', { bubbles: true }));
					}
				} else if (this.getAttribute('for') === 'screenshots') {
					const screenshotsInput = document.getElementById('screenshots');
					if (screenshotsInput) {
						const dt = new DataTransfer();
						Array.from(files).forEach(file => dt.items.add(file));
						screenshotsInput.files = dt.files;
						screenshotsInput.dispatchEvent(new Event('change', { bubbles: true }));
					}
				}
			}
		});
	});
}

function formatFileSize(bytes) {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function showError(message) {
	const errorEl = document.getElementById('formError');
	if (errorEl) {
		errorEl.textContent = message;
		errorEl.style.display = 'block';
	}
	
	setTimeout(hideError, 5000);
}

function hideError() {
	const errorEl = document.getElementById('formError');
	if (errorEl) {
		errorEl.style.display = 'none';
	}
}

function showSuccess(message) {
	const successEl = document.getElementById('formSuccess');
	if (successEl) {
		successEl.textContent = message;
		successEl.style.display = 'block';
	}
}

async function handleFormSubmit(e) {
	e.preventDefault();
	
	const form = e.target;
	const submitBtn = document.getElementById('submitBtn');
	const loadingEl = document.getElementById('formLoading');
	const successEl = document.getElementById('formSuccess');
	
	if (!form.checkValidity()) {
		form.reportValidity();
		return;
	}
	
	const modFileInput = document.getElementById('modFile');
	if (!modFileInput || !modFileInput.files || modFileInput.files.length === 0) {
		showError('Please select a mod file to upload');
		return;
	}
	
	const modFile = modFileInput.files[0];
	if (modFile.size > MAX_FILE_SIZE) {
		showError(`File size exceeds maximum of ${formatFileSize(MAX_FILE_SIZE)}`);
		return;
	}
	
	if (submitBtn) {
		submitBtn.disabled = true;
	}
	if (loadingEl) {
		loadingEl.style.display = 'flex';
	}
	hideError();
	if (successEl) {
		successEl.style.display = 'none';
	}
	
	try {
		const formData = new FormData(form);
		
		const existingScreenshots = formData.getAll('screenshots');
		existingScreenshots.forEach(() => formData.delete('screenshots'));
		
		selectedScreenshots.forEach((file) => {
			formData.append('screenshots', file, file.name);
		});
		
		const response = await fetch(API_ENDPOINT, {
			method: 'POST',
			body: formData
		});
		
		const result = await response.json();
		
		if (response.ok) {
			const successMessage = result.message || 'Mod submitted successfully! It will now be reviewed.';
			showSuccess(successMessage);
			form.reset();
			document.getElementById('fileInfo').style.display = 'none';
			document.getElementById('screenshotsPreview').innerHTML = '';
			document.getElementById('descriptionCharCount').textContent = '0';
			selectedScreenshots = [];
		} else {
			showError(result.message || result.error || 'Submission failed. Please try again.');
		}
	} catch (error) {
		console.error('Network error:', error);
		showError('A network error occurred during submission. Please check your connection and try again.');
	} finally {
		if (submitBtn) {
			submitBtn.disabled = false;
		}
		if (loadingEl) {
			loadingEl.style.display = 'none';
		}
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initUploadForm);
} else {
	initUploadForm();
}
