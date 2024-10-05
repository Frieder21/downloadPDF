import { Plugin, requestUrl } from 'obsidian';

export default class downloadPDF extends Plugin {
	async onload() {
		this.addCommand({
			id: "download-PDF-files-in-all-documents",
			name: "download PDF files in all documents",
			callback: async () => {
				var selection = this.app.vault.getMarkdownFiles();
				const regex = /\[[^\[]*\]\((https:\/\/.*\.pdf)\)/gm;
				const regexpath = /(\S*)\//g;
				const regexfilename = /([^\/]*\.pdf)$/g;
				const regexreplace = /(\[[^\[]*\])\(https:\/\/.*\.pdf\)/;
				for(const file in selection){
					let hä = await this.app.vault.read(selection[file])
					if(regex.test(hä)){
						//muss warum keine ahnung
						hä.match(regex);
						Promise.all([...hä.matchAll(regex)].map(match => {
							const url = match[1];
							return requestUrl({url:url})
							.then( res => res.arrayBuffer )
							.then(async blob => {
								var file_path = ""
								if (String(selection[file].path.match(regexpath)) == "null"){
									file_path = String(url.match(regexfilename))
								}
								else if (String(url.match(regexfilename))) {
									throw("nofilename valid")
								}
								else {
									file_path = String(selection[file].path.match(regexpath)) + String(url.match(regexfilename))
								}
								if (!(await this.app.vault.exists(file_path))){
									this.app.vault.createBinary(file_path, blob)
									hä = hä.replace(regexreplace, "$1("+file_path+")")
								}
								else if (await this.app.vault.exists(file_path)){
									hä = hä.replace(regexreplace, "$1("+file_path+")")
								}
						   })
							.catch(e => {
							  console.log(e);
							  return e;
							});
						})).then( wert => {
							console.log(wert)
							if (wert) {
								this.app.vault.modify(selection[file], hä)
							}
						})
					}
				}
			}
		});
	}
}