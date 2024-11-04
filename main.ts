import { Notice, Plugin, TFile, requestUrl } from 'obsidian';

export default class downloadPDF extends Plugin {
	async onload() {
		this.addCommand({
			id: "download-PDF-files-in-all-documents",
			name: "download PDF files in all documents",
			callback: async () => {
				try {
					let selection = this.app.vault.getMarkdownFiles();
					const regex = /\[[^\[]*\]\((https:\/\/.*\.pdf)\)/gm;
					const regexpath = /([\S\s]*)\//g;
					const regexfilename = /([^\/]*\.pdf)$/g;
					const regexreplace = /(\[[^\[]*\])\(https:\/\/.*\.pdf\)/;
					for(const file in selection){
						let hä = await this.app.vault.read(selection[file]);
						if(regex.test(hä)){
							//muss warum keine ahnung
							hä.match(regex);
							Promise.all([...hä.matchAll(regex)].map(async match => {
								const url = match[1];
								let file_path = "";
								if (String(selection[file].path.match(regexpath)) == "null"){
									file_path = String(url.match(regexfilename));
								}
								else if (String(url.match(regexfilename)) == "null") {
									throw new Error(String(url) + " is not able to generate valid filename/filepath");
								}
								else {
									file_path = String(selection[file].path.match(regexpath)) + String(url.match(regexfilename))
								}
								if (!(this.app.vault.getAbstractFileByPath(file_path) instanceof TFile)){
									try {
										let res = await requestUrl({url:url});
										if (!(res.arrayBuffer == null)) {
											this.app.vault.createBinary(file_path, res.arrayBuffer);
											hä = hä.replace(regexreplace, "$1("+file_path.replace(/ /g, "%20")+")");
											new Notice("downloadPDF: pdf file downloaded + created: " + file_path.replace(/ /g, "%20"))
											// console.log("downloadPDF: pdf file downloaded + created: " + file_path.replace(/ /g, "%20"))
										}
									}
									catch (e) {
										switch (String(e)) {
											case "Error: net::ERR_NAME_NOT_RESOLVED":
												try {
													if ((await requestUrl("https://www.frieda-universe.de"))!=null){
														new Notice("downloadPDF: Wrong link:\n" + url);
														console.error("downloadPDF: Wrong link:\n" + url);
													}
												}
												catch {
													new Notice("downloadPDF: No internet connection");
													console.error("downloadPDF: No internet connection");
												};
												break;
											case "Error: Request failed, status 404":
												new Notice("downloadPDF: File not avaiveble/Wrong link:\n" + url);
												console.error("downloadPDF: File not avaiveble/Wrong link:\n" + url);
												break;
											default:
												console.error("downloadPDF:  \"" + e + "\" ,pls report the bug <3");
												new Notice("downloadPDF: \"" + e + "\" ,pls report the bug <3");
										}
									}

								}
								else if (this.app.vault.getAbstractFileByPath(file_path) instanceof TFile) {
									hä = hä.replace(regexreplace, "$1("+file_path.replace(/ /g, "%20")+")");
								}
							})).then( async wert => {
								// console.log(wert)
								if (wert &&!((await this.app.vault.read(selection[file])) == hä)) {
									this.app.vault.modify(selection[file], hä)
									new Notice("downloadPDF: modified: "+ selection[file].name) // file crated todo
									// ("downloadPDF: modified: "+ selection[file].name)
								}
							})
						}
					}
				}
				catch (e) {
					console.error("downloadPDF:  \"" + e + "\" ,pls report the bug <3");
					new Notice("downloadPDF: \"" + e + "\" ,pls report the bug <3");
				}
			}
		});
	}
}