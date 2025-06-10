"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  File, Folder, FolderOpen, ChevronRight, ChevronDown, 
  Plus, Upload, MoreHorizontal, RefreshCw, FilePlus2, FolderPlus,
  Trash2, Copy, FileSymlink, Edit, Download, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// File types and their corresponding icons
export type FileType = 'tex' | 'bib' | 'pdf' | 'jpg' | 'png' | 'txt' | 'md' | 'csv' | 'json' | 'unknown';

export interface FileItem {
  id: string;
  name: string;
  type: FileType | 'folder';
  parentId: string | null;
  children?: FileItem[];
  isOpen?: boolean;
  path?: string;
  lastModified?: Date;
  content?: string;
}

interface FileExplorerProps {
  onFileSelect: (file: FileItem, focus?: boolean) => void; // Updated to accept an optional "focus" parameter
  selectedFile: FileItem | null;
  initialFiles?: FileItem[];
}

export default function FileExplorer({
  onFileSelect,
  selectedFile, // We will log this prop
  initialFiles = []
}: FileExplorerProps) {
  const { toast } = useToast();

  // Log when FileExplorer renders and what the selectedFile prop is
  console.log('[FileExplorer] Rendered. Current selectedFile prop:', selectedFile?.name, selectedFile?.id);

  // Initialize state directly using the useState initializer function
  const [files, setFiles] = useState<FileItem[]>(() => {
    if (initialFiles && initialFiles.length > 0) {
      return initialFiles;
    }
    // Default starter project files if none provided
    return [
      {
        id: 'main',
        name: 'main.tex',
        type: 'tex',
        parentId: null,
        content: '\\documentclass{article}\n\\begin{document}\n\\title{My LaTeX Document}\n\\author{TeXSync User}\n\\maketitle\n\nHello world!\n\n\\end{document}'
      },
      {
        id: 'refs',
        name: 'references.bib',
        type: 'bib',
        parentId: null,
        content: '@article{example,\n  author = {Author, A.},\n  title = {Example Article},\n  journal = {Journal of Examples},\n  year = {2023},\n}'
      },
      {
        id: 'images',
        name: 'images',
        type: 'folder',
        parentId: null,
        isOpen: false,
        children: []
      }
    ];
  });

  const [draggedFile, setDraggedFile] = useState<FileItem | null>(null);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemParentId, setNewItemParentId] = useState<string | null>(null);
  // const [showContextMenu, setShowContextMenu] = useState(false); // This state seems unused, consider removing
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Generate unique IDs for files
  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  // Determine file type from extension
  const getFileType = (fileName: string): FileType => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'tex': return 'tex';
      case 'bib': return 'bib';
      case 'pdf': return 'pdf';
      case 'jpg': case 'jpeg': return 'jpg';
      case 'png': return 'png';
      case 'txt': return 'txt';
      case 'md': return 'md';
      case 'csv': return 'csv';
      case 'json': return 'json';
      default: return 'unknown';
    }
  };

  // Toggle folder open/closed
  const toggleFolder = (id: string) => {
    setFiles(prev => {
      const updateFolderState = (items: FileItem[]): FileItem[] => {
        return items.map(item => {
          if (item.id === id) {
            return { ...item, isOpen: !item.isOpen };
          }
          if (item.children) {
            return { ...item, children: updateFolderState(item.children) };
          }
          return item;
        });
      };
      return updateFolderState(prev);
    });
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, file: FileItem) => {
    e.dataTransfer.setData('text/plain', file.id);
    setDraggedFile(file);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, folder?: FileItem) => {
    e.preventDefault();
    if (folder && folder.type === 'folder') {
      e.currentTarget.classList.add('bg-primary/10');
    }
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-primary/10');
  };

  // Handle drop for internal file movements
  const handleDrop = (e: React.DragEvent, targetFolder: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-primary/10');
    
    if (!draggedFile || targetFolder.type !== 'folder') return;
    
    // Don't allow dropping a folder into itself or its descendants
    if (draggedFile.type === 'folder') {
      if (draggedFile.id === targetFolder.id) {
        toast({
          title: "Invalid operation",
          description: "Cannot move a folder into itself",
          variant: "destructive"
        });
        return;
      }
      
      // Check if the target folder is a descendant of the dragged folder
      const isDescendant = (parent: FileItem, potentialChild: FileItem): boolean => {
        if (!parent.children) return false;
        
        for (const child of parent.children) {
          if (child.id === potentialChild.id) return true;
          if (child.type === 'folder' && isDescendant(child, potentialChild)) return true;
        }
        
        return false;
      };
      
      if (isDescendant(draggedFile, targetFolder)) {
        toast({
          title: "Invalid operation",
          description: "Cannot move a folder into its subdirectory",
          variant: "destructive"
        });
        return;
      }
    }
    
    // Move the file to the new folder with improved handling
    setFiles(prev => {
      // First create a deep copy without the dragged file
      const removeFileAndGetCopy = (items: FileItem[]): FileItem[] => {
        return items
          .filter(item => item.id !== draggedFile.id)
          .map(item => {
            if (item.children) {
              return {
                ...item,
                children: removeFileAndGetCopy(item.children)
              };
            }
            return { ...item };
          });
      };
      
      // Then add the dragged file to the target folder
      const addToFolder = (items: FileItem[], fileToAdd: FileItem): FileItem[] => {
        return items.map(item => {
          if (item.id === targetFolder.id) {
            return {
              ...item,
              isOpen: true,
              children: [...(item.children || []), { ...fileToAdd, parentId: targetFolder.id }]
            };
          }
          if (item.children) {
            return { ...item, children: addToFolder(item.children, fileToAdd) };
          }
          return item;
        });
      };
      
      // Get a deep copy without the dragged file
      const updatedFiles = removeFileAndGetCopy(prev);
      
      // Add the dragged file to the target folder
      const result = addToFolder(updatedFiles, draggedFile);
      
      toast({
        title: "File moved",
        description: `Moved ${draggedFile.name} to ${targetFolder.name}`,
      });
      
      return result;
    });
    
    setDraggedFile(null);
  };

  // Handle external file drops (upload)
  const handleExternalDrop = (e: React.DragEvent, targetFolder: FileItem | null = null) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-primary/10');
    
    if (!e.dataTransfer.files.length) return;
    
    const uploadedFiles = Array.from(e.dataTransfer.files);
    handleFileUpload(uploadedFiles, targetFolder?.id || null);
  };

  // Handle file upload either from drag-drop or file input
  const handleFileUpload = (uploadedFiles: File[], parentId: string | null = null) => {
    setIsUploading(true);
    
    const newFiles: FileItem[] = [];
    let filesProcessed = 0;
    
    uploadedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        const newFile: FileItem = {
          id: generateId(),
          name: file.name,
          type: getFileType(file.name),
          parentId: parentId,
          content: fileContent,
          lastModified: new Date(file.lastModified)
        };
        newFiles.push(newFile);
        
        filesProcessed++;
        if (filesProcessed === uploadedFiles.length) {
          addFilesToSystem(newFiles, parentId);
          setIsUploading(false);
          toast({
            title: "Files uploaded",
            description: `${uploadedFiles.length} file(s) have been uploaded`,
          });
        }
      };
      
      reader.readAsText(file);
    });
  };

  // Add files to the file system
  const addFilesToSystem = (newFiles: FileItem[], parentId: string | null) => {
    setFiles(prev => {
      const addToParent = (items: FileItem[]): FileItem[] => {
        if (!parentId) {
          return [...items, ...newFiles];
        }
        
        return items.map(item => {
          if (item.id === parentId) {
            const updatedChildren = [...(item.children || []), ...newFiles];
            return { ...item, children: updatedChildren, isOpen: true };
          }
          if (item.children) {
            return { ...item, children: addToParent(item.children) };
          }
          return item;
        });
      };
      
      return addToParent(prev);
    });
  };

  // Create new file
  const handleCreateFile = () => {
    setNewItemName('');
    setNewItemParentId(null);
    setIsCreatingFile(true);
  };

  // Create new file in a specific folder
  const handleCreateFileInFolder = (folderId: string) => {
    setNewItemName('');
    setNewItemParentId(folderId);
    setIsCreatingFile(true);
  };

  // Create new folder
  const handleCreateFolder = () => {
    setNewItemName('');
    setNewItemParentId(null);
    setIsCreatingFolder(true);
  };

  // Create new folder in a specific parent folder
  const handleCreateFolderInFolder = (folderId: string) => {
    setNewItemName('');
    setNewItemParentId(folderId);
    setIsCreatingFolder(true);
  };

  // Save new file
  const handleSaveNewFile = () => {
    if (!newItemName.trim()) return;
    
    const fileName = newItemName.includes('.') ? newItemName : `${newItemName}.tex`;
    
    const newFile: FileItem = {
      id: generateId(),
      name: fileName,
      type: getFileType(fileName),
      parentId: newItemParentId,
      content: '',
      lastModified: new Date()
    };
    
    addFilesToSystem([newFile], newItemParentId);
    setIsCreatingFile(false);
    
    toast({
      title: "File created",
      description: `New file ${fileName} has been created`,
    });
    
    // Select the new file
    onFileSelect(newFile);
  };

  // Save new folder
  const handleSaveNewFolder = () => {
    if (!newItemName.trim()) return;
    
    const newFolder: FileItem = {
      id: generateId(),
      name: newItemName,
      type: 'folder',
      parentId: newItemParentId,
      children: [],
      isOpen: false
    };
    
    addFilesToSystem([newFolder], newItemParentId);
    setIsCreatingFolder(false);
    
    toast({
      title: "Folder created",
      description: `New folder ${newItemName} has been created`,
    });
  };

  // Start rename operation
  const handleRename = (fileId: string) => {
    const findFile = (items: FileItem[]): FileItem | null => {
      for (const item of items) {
        if (item.id === fileId) {
          return item;
        }
        if (item.children) {
          const found = findFile(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const fileToRename = findFile(files);
    if (fileToRename) {
      setNewItemName(fileToRename.name);
      setIsRenaming(fileId);
    }
  };

  // Save renamed file/folder
  const handleSaveRename = () => {
    if (!newItemName.trim() || !isRenaming) return;
    
    setFiles(prev => {
      const renameItem = (items: FileItem[]): FileItem[] => {
        return items.map(item => {
          if (item.id === isRenaming) {
            // For files, preserve extension if one exists in the original name
            let newName = newItemName;
            if (item.type !== 'folder' && item.name.includes('.') && !newItemName.includes('.')) {
              const ext = item.name.split('.').pop();
              newName = `${newItemName}.${ext}`;
            }
            return { ...item, name: newName };
          }
          if (item.children) {
            return { ...item, children: renameItem(item.children) };
          }
          return item;
        });
      };
      
      return renameItem(prev);
    });
    
    setIsRenaming(null);
    toast({
      title: "Item renamed",
      description: `Item has been renamed to ${newItemName}`,
    });
  };

  // Delete file/folder
  const handleDelete = (fileId: string) => {
    // Find file/folder information for the toast
    const findItem = (items: FileItem[]): FileItem | null => {
      for (const item of items) {
        if (item.id === fileId) {
          return item;
        }
        if (item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const itemToDelete = findItem(files);
    
    // Delete the item
    setFiles(prev => {
      const deleteItem = (items: FileItem[]): FileItem[] => {
        return items.filter(item => {
          if (item.id === fileId) {
            return false;
          }
          if (item.children) {
            item.children = deleteItem(item.children);
          }
          return true;
        });
      };
      
      return deleteItem(prev);
    });
    
    // If we're deleting the selected file, unselect it
    if (selectedFile && selectedFile.id === fileId) {
      onFileSelect({
        id: 'main',
        name: 'main.tex',
        type: 'tex',
        parentId: null
      });
    }
    
    toast({
      title: "Item deleted",
      description: itemToDelete 
        ? `${itemToDelete.name} has been deleted` 
        : "Item has been deleted",
    });
  };

  // Trigger the hidden file input click to open file browser
  const handleUploadButtonClick = (parentId: string | null = null) => {
    setNewItemParentId(parentId);
    fileInputRef.current?.click();
  };

  // Handle file selection from file input
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(Array.from(e.target.files), newItemParentId);
      // Clear the input so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  // Recursive function to render file tree
  const renderFileTree = (items: FileItem[], level = 0) => {
    return items.map(item => {
      const isFolder = item.type === 'folder';
      // Log details for each item being rendered, and the current selectedFile prop
      // console.log(`[FileExplorer] Rendering item: ${item.name} (ID: ${item.id}). SelectedFile in render: ${selectedFile?.name} (ID: ${selectedFile?.id})`);
      const isCurrentFile = selectedFile && selectedFile.id === item.id;

      return (
        <React.Fragment key={item.id}>
          <ContextMenu>
            <ContextMenuTrigger>
              <div 
                className={cn(
                  "flex items-center group py-1 px-2 rounded-md select-none",
                  level > 0 && "ml-4",
                  isCurrentFile ? "bg-primary/20 text-primary" : "hover:bg-muted" // This line depends on selectedFile prop
                )}
                onClick={(e) => {
                  e.preventDefault(); // Prevent any default behavior
                  e.stopPropagation(); // Stop event bubbling
                  
                  if (isFolder) {
                    console.log(`[FileExplorer] Folder clicked: ${item.name} (ID: ${item.id})`);
                    toggleFolder(item.id);
                  } else {
                    console.log(`[FileExplorer] File clicked: ${item.name} (ID: ${item.id})`);
                    try {
                      // If this is the same file that's already selected, do nothing
                      if (selectedFile && selectedFile.id === item.id) {
                        console.log('[FileExplorer] File already selected');
                        return;
                      }
                      
                      // Call the parent component's callback
                      onFileSelect(getFileWithContent(item));
                      
                      // Visual feedback for selection
                      toast({
                        title: "File selected",
                        description: `${item.name} is now open in the editor`,
                        duration: 2000
                      });
                    } catch (error) {
                      console.error('[FileExplorer] Error selecting file:', error);
                      toast({
                        title: "Error",
                        description: "Failed to open the file",
                        variant: "destructive"
                      });
                    }
                  }
                }}
                // Add a double-click handler alongside the click handler
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  if (!isFolder) {
                    console.log(`[FileExplorer] File double-clicked: ${item.name}`);
                    
                    // Call onFileSelect with an additional "focus" parameter
                    // You'll need to update your onFileSelect prop type to accept this
                    onFileSelect(getFileWithContent(item), true);
                  }
                }}
                onDragStart={(e) => handleDragStart(e, item)}
                onDragOver={(e) => handleDragOver(e, isFolder ? item : undefined)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => {
                  if (isFolder) handleDrop(e, item);
                }}
                draggable
              >
                <div className="flex items-center flex-1 truncate">
                  {isFolder ? (
                    <div className="flex items-center">
                      {item.isOpen 
                        ? <ChevronDown size={16} className="mr-1 flex-shrink-0" />
                        : <ChevronRight size={16} className="mr-1 flex-shrink-0" />
                      }
                      {item.isOpen 
                        ? <FolderOpen size={16} className="mr-1.5 text-amber-500" /> 
                        : <Folder size={16} className="mr-1.5 text-amber-500" />
                      }
                    </div>
                  ) : (
                    <FileIcon type={item.type as FileType} className="mr-1.5" />
                  )}
                  <span className="truncate">{item.name}</span>
                </div>
                
                {/* Show actions on hover */}
                <div className="flex items-center opacity-0 group-hover:opacity-100">
                  {isFolder && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 mr-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateFileInFolder(item.id);
                      }}
                    >
                      <FilePlus2 size={12} />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal size={12} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {isFolder && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleCreateFileInFolder(item.id)}
                          >
                            <FilePlus2 size={14} className="mr-2" />
                            <span>New File</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleCreateFolderInFolder(item.id)}
                          >
                            <FolderPlus size={14} className="mr-2" />
                            <span>New Folder</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUploadButtonClick(item.id)}
                          >
                            <Upload size={14} className="mr-2" />
                            <span>Upload Files</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleRename(item.id)}
                      >
                        <Edit size={14} className="mr-2" />
                        <span>Rename</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(item.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 size={14} className="mr-2" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </ContextMenuTrigger>
            
            {/* Context Menu (right-click menu) */}
            <ContextMenuContent className="w-48">
              {isFolder && (
                <>
                  <ContextMenuItem onClick={() => handleCreateFileInFolder(item.id)}>
                    <FilePlus2 size={14} className="mr-2" />
                    <span>New File</span>
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleCreateFolderInFolder(item.id)}>
                    <FolderPlus size={14} className="mr-2" />
                    <span>New Folder</span>
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleUploadButtonClick(item.id)}>
                    <Upload size={14} className="mr-2" />
                    <span>Upload Files</span>
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                </>
              )}
              <ContextMenuItem onClick={() => handleRename(item.id)}>
                <Edit size={14} className="mr-2" />
                <span>Rename</span>
              </ContextMenuItem>
              {!isFolder && (
                <ContextMenuItem onClick={() => {
                  // Copy file content to clipboard if available
                  if (item.content) {
                    navigator.clipboard.writeText(item.content);
                    toast({
                      title: "Copied to clipboard",
                      description: `${item.name} content has been copied to clipboard`,
                    });
                  }
                }}>
                  <Copy size={14} className="mr-2" />
                  <span>Copy</span>
                </ContextMenuItem>
              )}
              <ContextMenuItem 
                onClick={() => handleDelete(item.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 size={14} className="mr-2" />
                <span>Delete</span>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
          
          {/* Render children for folders that are open */}
          {isFolder && item.isOpen && item.children && (
            <div className="mt-1">
              {renderFileTree(item.children, level + 1)}
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  // Add this useEffect to select a default file when the component mounts
  useEffect(() => {
    // If there are files but no selected file, select the first file by default
    if (files.length > 0 && !selectedFile) {
      // Find the first non-folder item to select by default
      const findFirstFile = (items: FileItem[]): FileItem | null => {
        for (const item of items) {
          if (item.type !== 'folder') {
            return item;
          }
          if (item.children && item.children.length > 0) {
            const foundInChildren = findFirstFile(item.children);
            if (foundInChildren) return foundInChildren;
          }
        }
        return null;
      };
      
      const defaultFile = findFirstFile(files);
      if (defaultFile) {
        console.log('[FileExplorer] Selecting default file:', defaultFile.name);
        onFileSelect(getFileWithContent(defaultFile));
      }
    }
  }, [files, selectedFile, onFileSelect]);

  // Add this to the component at the top level
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedFile) return;
    
    const findItem = (id: string, items: FileItem[]): FileItem | null => {
      for (const item of items) {
        if (item.id === id) {
          return item;
        }
        if (item.children) {
          const found = findItem(id, item.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    // Find all visible files for navigation
    const getAllVisibleFiles = (items: FileItem[]): FileItem[] => {
      let visibleFiles: FileItem[] = [];
      
      for (const item of items) {
        if (item.type !== 'folder') {
          visibleFiles.push(item);
        } else if (item.isOpen && item.children) {
          visibleFiles.push(item); // Add the folder itself
          visibleFiles = [...visibleFiles, ...getAllVisibleFiles(item.children)];
        } else {
          visibleFiles.push(item); // Add closed folders too
        }
      }
      
      return visibleFiles;
    };
    
    const visibleFiles = getAllVisibleFiles(files);
    const currentIndex = visibleFiles.findIndex(item => item.id === selectedFile.id);
    
    if (currentIndex === -1) return;
    
    // Handle arrow key navigation
    if (e.key === 'ArrowDown' && currentIndex < visibleFiles.length - 1) {
      const nextFile = visibleFiles[currentIndex + 1];
      if (nextFile.type !== 'folder') {
        onFileSelect(nextFile);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowUp' && currentIndex > 0) {
      const prevFile = visibleFiles[currentIndex - 1];
      if (prevFile.type !== 'folder') {
        onFileSelect(prevFile);
      }
      e.preventDefault();
    } else if (e.key === 'Enter') {
      // Toggle folders or open files on Enter
      const currentItem = visibleFiles[currentIndex];
      if (currentItem.type === 'folder') {
        toggleFolder(currentItem.id);
      } else {
        onFileSelect(currentItem, true); // Focus the editor
      }
      e.preventDefault();
    }
  }, [selectedFile, files, onFileSelect, toggleFolder]);

  // Add event listener for keyboard navigation
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Add this helper function to ensure file content is available
  const getFileWithContent = (file: FileItem): FileItem => {
    // If the file already has content, just return it
    if (file.content !== undefined) {
      return file;
    }
    
    // Otherwise, try to find the content in our files state
    const findFileWithContent = (items: FileItem[]): FileItem | null => {
      for (const item of items) {
        if (item.id === file.id) {
          return item;
        }
        if (item.children) {
          const found = findFileWithContent(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const fileWithContent = findFileWithContent(files);
    if (fileWithContent && fileWithContent.content) {
      return {
        ...file,
        content: fileWithContent.content
      };
    }
    
    // If we can't find content, provide default content based on file type
    let defaultContent = '';
    if (file.type === 'tex') {
      defaultContent = '\\documentclass{article}\n\\begin{document}\n\\title{Document Title}\n\\author{Author Name}\n\\maketitle\n\nYour content here.\n\n\\end{document}';
    } else if (file.type === 'bib') {
      defaultContent = '@article{example,\n  author = {Author, A.},\n  title = {Example Article},\n  journal = {Journal of Examples},\n  year = {2023},\n}';
    }
    
    return {
      ...file,
      content: defaultContent
    };
  };

  return (
    <div 
      className="h-full flex flex-col"
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-primary/5');
      }}
      onDragLeave={(e) => {
        e.currentTarget.classList.remove('bg-primary/5');
      }}
      onDrop={(e) => handleExternalDrop(e)}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <h2 className="font-semibold text-sm">EXPLORER</h2>
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-6 w-6"
            onClick={handleCreateFile}
          >
            <FilePlus2 size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-6 w-6"
            onClick={handleCreateFolder}
          >
            <FolderPlus size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-6 w-6"
            onClick={() => handleUploadButtonClick(null)}
          >
            <Upload size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              // Refresh files (in a real app, this would fetch from API)
              toast({
                title: "Refreshed",
                description: "Files list has been refreshed",
              });
            }}
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        {files.length > 0 ? (
          <div className="space-y-1">
            {renderFileTree(files)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Folder size={32} className="mb-2 opacity-50" />
            <p className="text-xs text-center">No files yet</p>
            <p className="text-xs text-center">Drop files here or create a new file</p>
          </div>
        )}
      </div>
      
      {isUploading && (
        <div className="p-2 border-t border-gray-800">
          <div className="flex items-center">
            <RefreshCw size={14} className="mr-2 animate-spin" />
            <span className="text-xs">Uploading files...</span>
          </div>
        </div>
      )}
      
      {/* Hidden file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInputChange}
        multiple
      />
      
      {/* Dialog for new file */}
      <Dialog open={isCreatingFile} onOpenChange={setIsCreatingFile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new file</DialogTitle>
            <DialogDescription>
              Enter a name for the new file
            </DialogDescription>
          </DialogHeader>
          <Input 
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="file.tex"
            className="mt-4"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveNewFile();
            }}
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsCreatingFile(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewFile}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for new folder */}
      <Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new folder</DialogTitle>
            <DialogDescription>
              Enter a name for the new folder
            </DialogDescription>
          </DialogHeader>
          <Input 
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="folder-name"
            className="mt-4"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveNewFolder();
            }}
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsCreatingFolder(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for rename */}
      <Dialog open={!!isRenaming} onOpenChange={(open) => {
        if (!open) setIsRenaming(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename item</DialogTitle>
            <DialogDescription>
              Enter a new name
            </DialogDescription>
          </DialogHeader>
          <Input 
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="mt-4"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename();
            }}
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsRenaming(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Component to display file icons based on type
function FileIcon({ type, className = "" }: { type: FileType, className?: string }) {
  switch (type) {
    case 'tex':
      return <FileText size={16} className={cn("text-blue-500", className)} />;
    case 'bib':
      return <FileText size={16} className={cn("text-green-500", className)} />;
    case 'pdf':
      return <File size={16} className={cn("text-red-500", className)} />;
    case 'jpg':
    case 'png':
      return <File size={16} className={cn("text-purple-500", className)} />;
    case 'txt':
    case 'md':
      return <FileText size={16} className={cn("text-gray-500", className)} />;
    case 'csv':
      return <FileText size={16} className={cn("text-yellow-500", className)} />;
    case 'json':
      return <File size={16} className={cn("text-amber-500", className)} />;
    default:
      return <File size={16} className={cn("text-gray-500", className)} />;
  }
}