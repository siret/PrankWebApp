import { getApiEndpoint } from "../prankweb-api";
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { Color } from "molstar/lib/mol-util/color";
import { Asset } from "molstar/lib/mol-util/assets";
import { StateTree } from "molstar/lib/mol-state/tree/immutable"

let structure: any;

export async function loadData(plugin: PluginUIContext, database: string, identifier: string, structureName: string) {
    return new Promise(async (accept, reject) => {
        const baseUrl: string = getApiEndpoint(database, identifier) + "/public";
        // Download pdb/mmcif and create a model.

        console.log(`${baseUrl}/${structureName}`)
        console.log(`${baseUrl}/prediction.json`);
  
        //let x = await fetchData(`${baseUrl}/prediction.json`);

        loadMMCIF(plugin, `${baseUrl}/${structureName}`, `${baseUrl}/prediction.json`);
    });
  }

export interface CustomWindow extends Window {
   plugin: any;
   StateTree: StateTree;
   MS: any;
   Script: any;
}


export async function loadMMCIF(plugin: PluginUIContext, structureUrl: string, predictionUrl: string) {
    // if (plugin) {
    //     await plugin.clear();
    // }
    /* let getUrl = (pdbId: string) => `https://www.ebi.ac.uk/pdbe/static/entry/${pdbId.toLowerCase()}_updated.cif`

    if(predicted) getUrl = (pdbId: string) => `https://alphafold.ebi.ac.uk/files/AF-${pdbId.toUpperCase()}-F1-model_v2.cif`
    */

    let data = await plugin.builders.data.download({
        url: Asset.Url(structureUrl),
        isBinary: false
    }, {state: {isGhost: true}});

    let trajectory;
    if(structureUrl.endsWith("cif")) trajectory = await plugin.builders.structure.parseTrajectory(data, "mmcif");
    else trajectory = await plugin.builders.structure.parseTrajectory(data, "pdb");

    const model = await plugin.builders.structure.createModel(trajectory);
    structure = await plugin.builders.structure.createStructure(model, {name: 'model', params: {}});

    //adds polymer representation
    const polymer = await plugin.builders.structure.tryCreateComponentStatic(structure, 'polymer');
    if (polymer) {
        await plugin.builders.structure.representation.addRepresentation(polymer, {
            type: 'gaussian-surface', //molecular-surface is probably better, but slower
            //type: 'cartoon',
            color: 'uniform', colorParams: {value: Color(0xFFFFFF)}
        });
    }

    //adds water molecules
    const water = await plugin.builders.structure.tryCreateComponentStatic(structure, 'water');
    if (water) {
        await plugin.builders.structure.representation.addRepresentation(water, {
            //type: 'gaussian-surface',
            type: 'ball-and-stick',
        });
    }

    //adds ligands
    const ligands = await plugin.builders.structure.tryCreateComponentStatic(structure, 'ligand');
    if (ligands) {
        await plugin.builders.structure.representation.addRepresentation(ligands, {
            type: 'ball-and-stick',
        });
    }

    return [model, structure, polymer]
}


  async function fetchData(url: string) {
    try {
        const response = await fetch(url, {
            method: 'GET'
        });
        const exam = await response.json();
        return exam;
    } catch (error) {
        console.error(error);
    }
  }