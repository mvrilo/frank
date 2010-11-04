var a = [];
(function ok() {
 	console.log(a);
 	if (process.argv[2] === 5) {
		console.log('if');
	}
	else {
		a.push('ok');
		process.argv[2] = 5;
		console.log('else');
		ok();
	}
})();
