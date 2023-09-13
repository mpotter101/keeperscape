// Base Components
import Tabber from '/incarnation/component/Tabber.js';
import Group from '/incarnation/component/Group.js';
import Button from '/incarnation/component/Button.js';
import TextFileInput from '/incarnation/component/TextFileInput.js';

// App Components
import AnimationForm from '/incarnation/AnimationForm.js';
import AboutForm from '/incarnation/AboutForm.js';

export default class App {
    constructor ({
        stageQuerySelector,
        headerQuerySelector,
        animationCategories,
        canvasHeight,
        canvasWidth,
        defaultFrameDuration,
        background,
        exportFileName
    }) {
        this.const = {};
        this.const.CANVAS_HEIGHT = canvasHeight;
        this.const.CANVAS_WIDTH = canvasWidth;
        this.const.DEFAULT_FRAME_DURATION = defaultFrameDuration;
        this.const.EXPORT_FILE_NAME = exportFileName

        this.groups = {
            animation: new Group ({
                parent: $(stageQuerySelector),
                label: {
                    content: 'Animations'
                }
            }),
            data: new Group ({
                parent: $("#footer-bar"),
                class: 'ui segment group data-area',
                label: {
                    content: 'Save/Load'
                }
            }),
        }

        this.dataImporter = new TextFileInput ({
            parent: $(document.body),
            onFile: (data) => { this.HandleDataImport (data); }
        })

        this.exportButton = new Button ({
            parent: $(document.body),
            label: 'Export Data',
            onClick: (e) => { this.ExportData (); }
        })

        this.importButton = new Button ({
            parent: $(document.body),
            label: 'Import Data',
            onClick: (e) => { this.dataImporter.node.click (); }
        })

        this.groups.data.addContent (this.exportButton.node);
        this.groups.data.addContent (this.importButton.node);

        this.animationCategoriesNames = Object.keys (animationCategories);

        this.animationTabbers = {};
        this.animationForms = {};

        this.animationCategoryTabber = new Tabber ({
            parent: $(document.body),
            tabs: this.animationCategoriesNames
        });

        var item, targetTabIndex;
        for (var key in animationCategories) {
            item = animationCategories [key];

            this.CreateAnimationsTabberForCategory ({
                categoryName: key,
                category: item,
                background,
            });
        }

        this.groups.animation.addContent (this.animationCategoryTabber.node);
    }

    CreateAnimationsTabberForCategory ({ category, categoryName, background }) {
        var targetTabIndex = this.animationCategoryTabber.getTabIndexByName (categoryName);

        this.animationTabbers [categoryName] = new Tabber ({
            parent: $(document.body),
            tabs: Object.keys (category)
        })

        this.animationCategoryTabber.addContent (
            targetTabIndex,
            this.animationTabbers [categoryName].node
        )

        this.CreateAnimationFormsForCategory ({
            category,
            categoryName,
            background,
            parentTabber: this.animationTabbers [categoryName]
        });
    }

    CreateAnimationFormsForCategory ({ category, categoryName, parentTabber, background }) {
        this.animationForms [categoryName] = {};

        var item;
        for (var key in category) {
            item = category [key];

            this.animationForms [categoryName] [key] = new AnimationForm (
                {
                    parent: $(document.body),
                    categoryName,
                    background,
                    name: key,
                    optional: item.optional,
                    frameCount: 5,
                    frameDuration: this.const.DEFAULT_FRAME_DURATION,
                    canvasHeight: this.const.CANVAS_HEIGHT,
                    canvasWidth: this.const.CANVAS_WIDTH,
                    scrollDir: item.scrollDir,
                }
            );

            var targetTabIndex = parentTabber.getTabIndexByName (key);

            parentTabber.addContent (
                targetTabIndex,
                this.animationForms [categoryName] [key].node
            );

            if (item.optional) {
                parentTabber.tabs [targetTabIndex].node.addClass ('optional');
            }
        }
    }

    CollectStateData () {
        var data = {};
        data.animationCategories = {};

        Object.keys (this.animationTabbers).forEach ((name) => {
            data.animationCategories [name] = {};

            Object.keys (this.animationForms [name]).forEach ((key) => {
                console.log (name, key)
                var item = this.animationForms [name] [key];
                data.animationCategories [name] [item.state.name] = item.GetState ();
            })
        });

        return data;
    }

    HandleDataImport (data) {
        console.log ("received file!");
        console.log (data.value);
        var json = JSON.parse (data.value);

        // about form
        Object.keys (json.animationCategories).forEach ((categoryName) => {
            Object.keys (json.animationCategories [categoryName]).forEach ((animationName) => {
                console.log (this.animationForms)
                console.log (categoryName + ' ' + animationName)
                this.animationForms [categoryName] [animationName].ImportData (json.animationCategories [categoryName] [animationName]);
            })
        })
    }

    ExportData () {
        var data = this.CollectStateData();
        var name = this.const.EXPORT_FILE_NAME;
        var jsonFileContent = JSON.stringify (data, null, 4);
        this.Download (jsonFileContent, name, "text/plain");
    }

    // Borrowd from here: http://www.4codev.com/javascript/download-save-json-content-to-local-file-in-javascript-idpx473668115863369846.html
    Download(content, fileName, contentType) {
        const a = document.createElement("a");
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }
}
