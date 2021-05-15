const FormsetSnippet = `{{ form:set in="$1" }}

{{ if {form:errors} }}
	{{ form:errors }}

	{{ /form:errors }}
{{ /if }}

{{ if {form:success} }}

{{ /if }}

{{ form:create }}
	$2
{{ /form:create }}

{{ /form:set }}`;

export default FormsetSnippet;
