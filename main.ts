import { App, Plugin, PluginSettingTab, Setting } from "obsidian";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	classPrefix: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	classPrefix: "theme-",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	private themeClassName: string | null = null;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		//
		this.registerEvent(
			this.app.workspace.on("css-change", () => {
				this.updateCssClass();
			})
		);

		this.updateCssClass();
	}

	onunload() {
		this.removeCssClass();
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	updateCssClass() {
		const selectedTheme: string =
			(this.app.vault as any).config?.cssTheme || "default";

		const selectedThemeSanitized = selectedTheme
			.toLowerCase()
			.replace(" ", "");

		const newThemeClassName =
			this.settings.classPrefix + selectedThemeSanitized;

		this.removeCssClass();
		this.themeClassName = newThemeClassName;
		document.body.classList.add(newThemeClassName);
	}

	removeCssClass() {
		if (this.themeClassName !== null) {
			document.body.classList.remove(this.themeClassName);
		}
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Prefix")
			.setDesc("Prefix of the attached css class")
			.addText((text) =>
				text
					.setPlaceholder("Enter your Prefix")
					.setValue(this.plugin.settings.classPrefix)
					.onChange(async (value) => {
						this.plugin.settings.classPrefix = value;
						await this.plugin.saveSettings();
						this.plugin.updateCssClass();
					})
			);
	}
}
