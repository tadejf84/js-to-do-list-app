document.addEventListener('DOMContentLoaded', function() {
	const datePickerEl = document.querySelectorAll('.datepicker');
	const tabsEl = document.querySelector('.tabs');

	// date picker init
	const datePickerInit = M.Datepicker.init(datePickerEl, {
		format: 'd. m. yyyy'
	});

	// tabs init
	const tabInit = M.Tabs.init(tabsEl, {});
});
