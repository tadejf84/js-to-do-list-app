document.addEventListener('DOMContentLoaded', function() {
	const datePickerEl = document.querySelectorAll('.datepicker');
	const tabsEl = document.querySelector('.tabs');

	// Date picker init
	const datePickerInit = M.Datepicker.init(datePickerEl, {
		format: 'd. m. yyyy'
	});

	// Tabs init
	const tabInit = M.Tabs.init(tabsEl, {});
});
