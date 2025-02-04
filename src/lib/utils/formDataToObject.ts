let nestedRegex = /[\.\[\]]/;

export default function formDataToObject(formData: FormData): any {
	let object = {};

	formData.forEach((value, path) => {
		let target = object;
		let key = path;

		// Do some rudimentary processing of the value in case it's empty, null, a bool or a number
		let newValue = processValue(value);

		// If there's a dot or a bracket in the path, we need to get the (possibly nested or in an array) target
		if (path.match(nestedRegex)) {
			const parts = path
				// NOTE: Use & to indicate an automatic array, because there shouldn't be any properties with that name?
				.replace(/\[\]/g, "[&]")
				// Replace all brackets with dots
				.replace(/[\[\]]/g, ".")
				// Split on dots
				.split(".")
				// Remove empty entries
				.filter(Boolean);

			// Loop through the parts and get the target object
			// NOTE: Don't get the target from the last part -- that's the key
			for (let i = 0; i < parts.length - 1; i++) {
				const isArray = !isNaN(parseInt(parts[i + 1])) || parts[i + 1] === "&";
				target = getTarget(target, parts[i], isArray);
			}

			// Get the key from the last part
			key = parts[parts.length - 1];
		}

		// Set the value of the target
		setValue(target, key, newValue);
	});

	return object;
}

function processValue(value: any): any {
	if (typeof value === "string") {
		if (value === "") {
			// NOTE: Leave it empty, otherwise Number("") resolves to 0
		} else if (value === "null") {
			return null;
		} else if (value === "true" || value === "on") {
			return true;
		} else if (value === "false") {
			return false;
		} else if (!isNaN(Number(value))) {
			return Number(value);
		}
	}
	return value;
}

function getTarget(target: any, part: string, isArray: boolean) {
	// If this is our automatic array indicator, just push a new item into the array and return it
	if (part === "&") {
		target.push(isArray ? [] : {});
		return target[target.length - 1];
	}

	// Make sure the target property exists, and set it to the default array/object value
	if (!Reflect.has(target, part)) {
		target[part] = isArray ? [] : {};
	}

	// Return the new target
	return target[part];
}

function setValue(target: any, key: string, value: any) {
	// If the target is an array, set the value of the correct item
	if (Array.isArray(target)) {
		// If this is our automatic array indicator, just push a new item into the array
		if (key === "&") {
			target.push(value);
		} else {
			const arrayIndex = parseInt(key);
			target[arrayIndex] = value;
		}
		return;
	}

	// If the property doesn't exist, set it and return
	if (!Reflect.has(target, key)) {
		target[key] = value;
		return;
	}

	// If the property does exist, make sure it's an array and add the value
	if (!Array.isArray(target[key])) {
		target[key] = [target[key]];
	}
	target[key].push(value);
}
