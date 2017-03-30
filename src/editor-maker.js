const outer = JavascriptLibrary.CreatePackage(null, '/Script/Javascript');

function maybe_create_group(path) {
    let groups = global.$groups = global.$groups || {};
    if (!groups[path]) {
        let cur = JavascriptEditorLibrary;
        path.split('.').forEach((v, k) => {
            console.log(cur, k);
            let x = cur.GetGroup && cur.GetGroup(v);
            if (!x) {
                x = cur.AddGroup(v);
            }
            cur = x;
        });
        groups[path] = cur;
    }
    return groups[path];
}

function makeTab(opts, tab_fn, del_fn) {
    opts = opts || {};
    var tab = new JavascriptEditorTab();
    tab.TabId = opts.TabId || 'TestJSTab';
    tab.Role = opts.Role || 'NomadTab';
    tab.DisplayName = opts.DisplayName || '안녕하세요!';
    tab.Group = opts.Group || global.group;
    tab.OnSpawnTab.Add(tab_fn);
    if (del_fn) {
        tab.OnCloseTab.Add(del_fn);
    }
    return tab;
}

function tabSpawner(opts, main) {
    let $tabs = global.$tabs = global.$tabs || {};
    let $inner = global.$tabinner = global.$tabinner || [];
    let $fns = global.$tabfns = global.$tabfns || {};
    const id = opts.TabId;

    $fns[id] = main;
    let opened = $tabs[id];

    function create_inner(fn, where) {
        let child;
        try {
            child = fn();
        } catch (e) {
            console.error(String(e), e.stack);
            child = new TextBlock();
            child.SetText(`ERROR:${String(e)}`);
        }
        $inner.push(child);
        where.AddChild(child);
    }
    if (opened) {
        opened.forEach(open => {
            let old = SizeBox.C(open).GetChildAt(0);
            old.RemoveFromParent();
            $inner.splice($inner.indexOf(old), 1);
            SizeBox.C(open).RemoveChildAt(0);
            create_inner(main, open);
        });
        return _ => {};
    }

    opened = $tabs[id] = [];

    let tab = makeTab(opts, context => {
        let widget = new SizeBox();
        let fn = $fns[id];
        opened.push(widget);
        create_inner(fn, widget);

        return widget;
    }, widget => {
        let content = widget.GetContentSlot().Content;
        content.RemoveFromParent();
        $inner.splice($inner.indexOf(widget.GetChildAt(0)), 1);
        opened.splice(opened.indexOf(widget), 1);
    });
    tab.Commit();

    opened.$spawner = tab;
}


function windowSpawner(opts, design) {
    let container = new JavascriptWindow(outer);
    container.SizingRule = EJavascriptSizingRule.Autosized;
    container.Title = opts.Title || 'Window'
    container.AddChild(design());       
    container.TakeWidget().AddWindow();
    process.nextTick(_ => container.BringToFront())
    return () => {
        container.RequestDestroyWindow();
    }
}

module.exports = {
    spawnTab : (design, opts = {}) => {
        tabSpawner({
            DisplayName: opts.Title,
            TabId: opts.TabId,
            Group: maybe_create_group(opts.Group || 'Root.A2')
        }, design);        
    },
    spawnWindow: (design, opts = {}) => {
        return windowSpawner({
            Title: opts.Title
        }, design)
    }
}