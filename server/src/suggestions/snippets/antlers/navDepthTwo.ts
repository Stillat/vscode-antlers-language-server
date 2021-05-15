const NavDepthTwoSnippet = `<ul>
{{ nav }}
	{{ if depth == 1 }}
		$1
		{{ if children }}
			<ul>{{ *recursive children* }}</ul>
		{{ /if }}
	{{ elseif depth == 2 }}
		
	{{ /if }}
{{ /nav }}
</ul>`;

export default NavDepthTwoSnippet;
