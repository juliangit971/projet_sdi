let ingredientSections = 1;
let stepSections = 1;
let postID = null;

$(function () {

    $('#formLoader').load("/api/create-post/part1", function () {  // Charger les données, puis quand le chargement est fini

        $('#inputFile').on('change', function (){   // Prévisualiser l'image importée SANS l'enregister sur le serveur

            const file = $('#inputFile').prop('files');  // Enregistrement de l'image en mémoire
    
            if (file) {
                $("#presentationImage")
                    .attr('src', URL.createObjectURL(file[0]))
                    .attr('alt', file[0].name)
            }
        });


        $('#formPart1').on('submit', function (e1){   // Enregistrer la 1ère partie des données

            e1.preventDefault(); // Empêcher le rafraichissement de la page
    
            const file = $('#inputFile').prop('files');  // Enregistrement de l'image en mémoire
            const formData = new FormData(this);
            formData.append('inputFile', file)           // Image de présentation

    
            //Requête AJAX
            $.ajax({
                url: '/api/create-post/part1',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: (res) => {

                    postID = res.postID;  // Stockage de l'ID pour faciliter les retours en arrière dans le futur

                    $('#formLoader').empty();   // Vider la div pour enlever le formulaire

                    $('#formLoader').load("/api/create-post/part2", function () {   // Charger la 2ème partie données, puis quand le chargement est fini

                        $(document).on('change', '.stepInputFile', function (){   // Prévisualiser l'image importée SANS l'enregister sur le serveur (Cette écriture permet à ce que les élément ajouté dynamiquement fonctionne)

                            let imageLocationID = $(this).attr('id').split("_");   // Obtenir l'ID de l'input cliqué
                            imageLocationID = imageLocationID[imageLocationID.length - 1];

                            const file = $(`#stepInputFile_${imageLocationID}`).prop('files'); 
                    
                            if (file) {
                                $(`#step_${imageLocationID}_image`)
                                    .attr('src', URL.createObjectURL(file[0]))
                                    .attr('alt', file[0].name)
                            }
                        });


                        $('#addIngredient').on('click', function () {

                            ingredientSections++;

                            $('#ingredients').append(`

                                <div class="inline">
                                    <h3>Ingrédient</h3>
                                    <h3 id="num_ingredient">${ingredientSections}</h3>  
                                </div>

                                <div class="option_ingredient">
                                
                                    <input class="ingredient" id="ingredient_${ingredientSections}" name="ingredient_${ingredientSections}" placeholder ="Saisissez un ingrédient" type="text" required>
                                    <br>
                        
                                    <div class="second_line">
                                        <input  class="quantity" id="quantity_${ingredientSections}" name="quantity_${ingredientSections}" placeholder ="Saisissez une quantité" type="number" min="1" required>
                                        <input  class="unit" id="unit_${ingredientSections}" name="unit_${ingredientSections}" placeholder ="Saisissez une unité" type="text" required>
                                    </div>

                                </div>

                            `)
                        });

                        $('#addStep').on('click', function () {

                            stepSections++;

                            $('#steps').append(`

                                <div class="inline">
                                    <h3>Étape</h3>
                                    <h3 id="num_step">${stepSections}</h3>  
                                </div>

                                <div class="option_step">

                                    <textarea  class="step" id="description" name="step_${stepSections}" placeholder ="Étape ${stepSections} de la recette..." required></textarea>

                                    <label class="image_button2" for="stepInputFile_${stepSections}">
                                        <img src="/medias/website/common/camera-outline.png" class="stepImage" id="step_${stepSections}_image" alt="Image affichée">
                                        <input type="file" id="stepInputFile_${stepSections}" class="stepInputFile" name="stepInputFile_${stepSections}" accept="image/png, .jpg, .jpeg">
                                    </label>

                                </div>
                            `)
                            
                        });


                        $('#formPart2').on('submit', function (e2){   // Enregistrer la 2ème partie des données

                            e2.preventDefault(); // Empêcher le rafraichissement de la page
                    
                            // Mettre l'ID comme premier objet du formulaire, sinon Multer ne voit pas le nouvel objet (Probablement un bug de Multer)
                            // --> Voici la méthode pour mettre l'ID à passer au nom des images en premier dans le FormData
                            const tempFormData = new FormData(this)
                            const formData = new FormData();
                            formData.append("postID", postID)
                            formData.append("ingredientSections", ingredientSections)    // Ajouter du nombre de section des ingrédients
                            formData.append("stepSections", stepSections)                // et du nombre de section des étapes pour faire des itérations dans le backend
                            
                            for (const pair of tempFormData.entries()) {
                                formData.append(pair[0], pair[1])
                            }
                            // <--


                            // Requète AJAX
                            $.ajax({
                                url: '/api/create-post/part2',
                                type: 'POST',
                                data: formData,
                                processData: false,
                                contentType: false,
                                success: () => {
                
                                    $('#formLoader').empty();   // Vider la div pour enlever le formulaire
                
                                    $('#formLoader').load("/api/create-post/part3", function () {   // Charger la 3ème partie données, puis quand le chargement est fini

                                        let tags;

                                        $.ajax({    // Demande des tags au serveur
                                            url: '/api/create-post/tags',
                                            type: 'GET',
                                            success: (res) => {
                                                tags = res.tags;
                                            },
                                            error: (err) => {
                                                tags = null;
                                                console.log("[ERROR !] Unable to fetch tags!");
                                            }
                                        });


                                        $("#tags").on('keydown', function(event) {
                                            // Don't navigate away from the field on tab when selecting an item

                                            if (event.key === "Tab" && $(this).data("uiAutocomplete").menu.active) {
                                                event.preventDefault();
                                            }
                                        })
                                        .autocomplete({
                                            minLength: 0,
                                            source: function(request, response) {
                                                let term = request.term.split(" ").pop();  // Prendre le dernier mot de l'input
                                                let results;

                                                /* Si l'utilisateur entre "#": */
                                                if (term.indexOf("#") > -1) {

                                                    const termWithoutHash = term.split("#").pop();

                                                    /* Si l'utilisateur écrit quelque chose après le "#" ET que la liste des tags n'est pas "null" */
                                                    if (termWithoutHash.length > 0 && tags != null) {

                                                        results = tags.filter(tag => {
                                                            if (tag.toLowerCase().startsWith(termWithoutHash.toLowerCase())) {
                                                                return "#" + tag;
                                                            }
                                                        })
                                                        
                                                        /* Appeller la fonction callback avec les réponses possibles */
                                                        response(results);
                                                    }
                                                }
                                            },
                                            focus: function() {
                                                // Empêcher la valeur d'être insérée si focus
                                                return false;
                                            },
                                            select: function(event, ui) {
                                                let terms = this.value.split(" ");
                                                // Enlever le tag non finie se trouvant à la fin de la chaine de caractère
                                                terms.pop();
                                                // Ajouter l'item sélectionné
                                                terms.push("#" + ui.item.value);
                                                // Add placeholder to get the comma-and-space at the end
                                                terms.push("");
                                                this.value = terms.join(" ");
                                                return false;
                                            }
                                        });

                                        $('#formPart3').on('submit', function (e){   // Enregistrer la 2ème partie des données
                                            
                                            e.preventDefault(); // Empêcher le rafraichissement de la page

                                            const formData = $(this).serializeArray();   // Formatter les formulaire pour l'envoyer

                                            $.post('/api/create-post/part3', { formData: JSON.stringify(formData), postID: postID}, (res) => {
                                                
                                                if ('error' in res) {
                                                    alert("Réponse : " + res.error);
                                                } else {
                                                    window.location.replace(res.redirect)  // Rediriger ver l'accueil sans enregistrer les pages précédentes dans l'historique
                                                }
                                            });
                                        
                                        });
                                    });
                                },
                                error: (err) => {
                                    console.error("[ERREUR !] Impossible d'uploader le formulaire!\n" + err)
                                }
                            });
                        });

                    });
                },
                error: (err) => {
                    console.error("[ERREUR !] Impossible d'uploader le formulaire!\n" + err)
                }
            });
        });
    })
});
