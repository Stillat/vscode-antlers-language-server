const excludeNameRegex = new RegExp(/((not_from)|(not_folder)|(dont_use))="([A-Za-z0-9 _]*)"/);
const dataAliasRegex = new RegExp(/as="([A-Za-z0-9 _]*)"/);
const paginatedRegex = new RegExp(/paginate="([A-Za-z0-9 _]*)"/);

export { excludeNameRegex, dataAliasRegex, paginatedRegex };
