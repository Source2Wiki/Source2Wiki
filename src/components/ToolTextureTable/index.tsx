import React, { useState, useMemo, useRef, useEffect } from 'react';
import styles from './styles.module.css';
import clsx from "clsx";
import DateRender from "@site/src/components/DateRenderer";
import MaterialAttributes from "@site/src/constants/materialAttributes";

import cs2_data from '@site/tooltex_dump/tooltexdump_cs2.json'
import hla_data from '@site/tooltex_dump/tooltexdump_hla.json'
import steamvr_data from '@site/tooltex_dump/tooltexdump_steamvr.json'
import dota2_data from '@site/tooltex_dump/tooltexdump_dota2.json'

import global_descriptions from '@site/tooltex_dump/tooltex_description.json'
import cs2_descriptions from '@site/tooltex_dump/tooltex_description_cs2.json'
import hla_descriptions from '@site/tooltex_dump/tooltex_description_hla.json'
import steamvr_descriptions from '@site/tooltex_dump/tooltex_description_steamvr.json'
import dota2_descriptions from '@site/tooltex_dump/tooltex_description_dota2.json'

interface ToolTexTableProps {
  game?: string;
}
interface ToolTexDump{
  Timestamp: number,
  ToolMaterials: ToolTexture[]
}

interface ToolTexture {
  Name: string
  TexturePath: string
  Description: string;
  Attributes: ToolTextureAttribute[];
}

interface ToolTextureAttribute {
  Name: string
  Value: number
}

interface DescriptionOverrides {
  [textureName: string]: string;
}

const ToolTexTable: React.FC<ToolTexTableProps> = ({ game }) =>{
  const getDataForGame = (gameKey?: string) => {
    switch (gameKey) {
      case 'cs2':
        return cs2_data;
      case 'hla':
        return hla_data;
      case 'dota2':
        return dota2_data;
      case 'steamvr':
        return steamvr_data;
      case 'default':
        return null;
    }
  };

  const getPrettyAttributeName = (attribute: string): string => {
    const trimmed = attribute.trim();
    return MaterialAttributes[trimmed] || trimmed;
  };

  const hasPrettyName = (attribute: string): boolean => {
    const trimmed = attribute.trim();
    return trimmed in MaterialAttributes;
  };

  const getDescriptionsForGame = (gameKey?: string): DescriptionOverrides => {
    switch (gameKey) {
      case 'cs2':
        return cs2_descriptions as DescriptionOverrides;
      case 'hla':
        return hla_descriptions as DescriptionOverrides;
      case 'dota2':
        return dota2_descriptions as DescriptionOverrides;
      case 'steamvr':
        return steamvr_descriptions as DescriptionOverrides;
      default:
        return {};
    }
  };

  const getDescriptionForTexture = (textureName: string, originalDescription: string): string => {
    // priority: game-specific > global > original
    const gameDescriptions = getDescriptionsForGame(game);
    const globalDescs = global_descriptions as DescriptionOverrides;
    
    if (gameDescriptions[textureName] && gameDescriptions[textureName].length > 0) {
      return gameDescriptions[textureName];
    }
    
    if (globalDescs[textureName]) {
      return globalDescs[textureName];
    }
    
    return originalDescription;
  };

  const toolTextureData = useMemo(() => getDataForGame(game), [game]) as ToolTexDump;
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredtoolTextureData = useMemo(() => {
    
    if (!toolTextureData || !toolTextureData.ToolMaterials) return [];

    let filtered = toolTextureData.ToolMaterials;
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(textureData => 
        textureData.Name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [toolTextureData, searchTerm, game]);

  return (
    <div className={styles.table}>
      <div>
        A searchable list of every tool texture in every Source2 game.
      </div>
      <div>
        All tool textures containt the <code className={styles.code}>tools.toolsmaterial</code> material attribute, as such it has been omitted from the attribute list.
      </div>
      <div className={styles.searchBox}>
        <input 
          className={clsx("navbar__search-input", styles.input)} 
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredtoolTextureData.length === 0 ? (
        <div className={styles.noResults}>
          No tool textures found.
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap'}}>
            <div className={styles.resultsCount}>
              Showing {filteredtoolTextureData.length} of {toolTextureData.ToolMaterials.length} tool textures.
            </div>
            <div className={styles.resultsCount} style = {{textAlign: 'right',}}>
              Last updated: <DateRender unix={toolTextureData.Timestamp} />
            </div>
          </div>
          
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Texture</th>
                <th>Name</th>
                <th>Description</th>
                <th>Attributes</th>
              </tr>
            </thead>
            <tbody>
              {filteredtoolTextureData.map((toolTexture, index) => {

                const description = getDescriptionForTexture(toolTexture.Name, toolTexture.Description);
                
                return (
                  <tr key={index} className={styles.clickableRow}>
                    
                    <td>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {toolTexture.TexturePath && (
                            <img 
                              src={toolTexture.TexturePath.replace("static", "")}
                              alt={toolTexture.Name}
                              style={{ width: '128px', height: '128px' }}
                            />
                          )}
                        </div>
                    </td>

                    <td>
                       <code className={styles.code} dangerouslySetInnerHTML={{ __html: toolTexture.Name }}/>
                    </td>

                    <td dangerouslySetInnerHTML={{ __html: description }} />
                    
                    <td>
                      {toolTexture.Attributes.length > 0 ? (
                        <ul className={styles.attributeList}>
                          {toolTexture.Attributes.map((attr, index) => {
                            const prettyName = getPrettyAttributeName(attr.Name);
                            const hasPretty = hasPrettyName(attr.Name);
                            
                            return (
                              <li key={index}>
                                {hasPretty ? (
                                  <>
                                    {prettyName} (<code className={styles.code}>{attr.Name.trim()}</code>) 
                                    {attr.Value > 1 ? <> = <code className={styles.code}>{attr.Value}</code></> : ""} 
                                  </>
                                ) : (
                                  <code className={styles.code}>{attr.Name.trim()}</code>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      ) : ""}
                    </td>
                    
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ToolTexTable;