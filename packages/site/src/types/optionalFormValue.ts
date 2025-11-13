import * as v from "valibot";

/**
 * Creates a validation for an optional field that should be coerced from an
 * empty string (e.g. if it was set to the empty string by FormData).
 *
 * For example, you may have a boolean that is put in a hidden input, and will
 * be submitted as an empty string if it is not set. This validation will take
 * the empty string and convert it to undefined.
 *
 * @param base The underlying field type validation e.g. v.boolean()
 */
export default function optionalFormValue<T1, T2, T3 extends v.BaseIssue<unknown>>(
	base: v.BaseSchema<T1, T2, T3>,
) {
	return v.optional(
		v.union([
			// Accept a value of the base type (e.g. a boolean)
			base,
			// Accept an empty string, and transform it to undefined
			v.pipe(
				v.custom<"">(() => true),
				v.transform(() => undefined),
			),
		]),
	);
}
