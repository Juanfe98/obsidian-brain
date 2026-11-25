on run argv
    set ownedName to item 1 of argv
    set destinationPath to item 2 of argv
    set openedDocument to missing value
    with timeout of 70 seconds
        tell application "Keynote"
            try
                -- LaunchServices owns the import. Opening again here creates a
                -- second unsaved document and leaks the first one.
                repeat 160 times
                    if exists document ownedName then
                        set openedDocument to document ownedName
                        exit repeat
                    end if
                    delay 0.25
                end repeat
                if openedDocument is missing value then error "Keynote could not import the owned PPTX copy. Check its import dialog and file permissions."
                export openedDocument to POSIX file destinationPath as PDF
                close openedDocument saving no
                return "Keynote " & version
            on error messageText number errorNumber
                if openedDocument is not missing value then
                    try
                        with timeout of 5 seconds
                            close openedDocument saving no
                        end timeout
                    end try
                end if
                error messageText number errorNumber
            end try
        end tell
    end timeout
end run
