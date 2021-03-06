import java.util.*;

/**
 * The TableSym class defines a symbol-table entry. 
 * Each TableSym contains a type (a Type).
 */
public class TableSym {
    private Type type;
    private int offset = 0;
    private boolean global = false;
    private static int localoffset = -8;
    
    public TableSym(Type type) {
        this.type = type;
    }
    
    public Type getType() {
        return type;
    }
    
    public String toString() {
        return type.toString();
    }

    public void setOffset(int offset) {
        this.offset = offset;
    }

    public int getOffset() {
        return this.offset;
    }

    public static void setLocalOffset(int localoffset) {
        TableSym.localoffset = localoffset;
    }

    public static int getLocalOffset() {
        return TableSym.localoffset;
    }

    public void setGlobal() {
        this.global = true;
    }

    public boolean getGlobal() {
        return this.global;
    }
}

/**
 * The FnSym class is a subclass of the TableSym class just for functions.
 * The returnType field holds the return type and there are fields to hold
 * information about the parameters.
 */
class FnSym extends TableSym {
    // new fields
    private Type returnType;
    private int numParams;
    private List<Type> paramTypes;
    private int sizeParams = 0;
    private int sizeLocals = 0;
    
    public FnSym(Type type, int numparams) {
        super(new FnType());
        returnType = type;
        numParams = numparams;
    }

    public void addFormals(List<Type> L) {
        paramTypes = L;
    }
    
    public Type getReturnType() {
        return returnType;
    }

    public int getNumParams() {
        return numParams;
    }

    public List<Type> getParamTypes() {
        return paramTypes;
    }

    public String toString() {
        // make list of formals
        String str = "";
        boolean notfirst = false;
        for (Type type : paramTypes) {
            if (notfirst)
                str += ",";
            else
                notfirst = true;
            str += type.toString();
        }

        str += "->" + returnType.toString();
        return str;
    }

    public void setSizeParams(int params) {
        this.sizeParams = params;
    }

	public int getSizeParams() {
		return this.sizeParams;
    }
    
    public void setSizeLocals(int params) {
        this.sizeLocals = params;
    }

	public int getSizeLocals() {
		return this.sizeLocals;
	}
}

/**
 * The StructSym class is a subclass of the TableSym class just for variables 
 * declared to be a struct type. 
 * Each StructSym contains a symbol table to hold information about its 
 * fields.
 */
class StructSym extends TableSym {
    // new fields
    private IdNode structType;  // name of the struct type
    
    public StructSym(IdNode id) {
        super(new StructType(id));
        structType = id;
    }

    public IdNode getStructType() {
        return structType;
    }    
}

/**
 * The StructDefSym class is a subclass of the TableSym class just for the 
 * definition of a struct type. 
 * Each StructDefSym contains a symbol table to hold information about its 
 * fields.
 */
class StructDefSym extends TableSym {
    // new fields
    private SymTable symTab;
    
    public StructDefSym(SymTable table) {
        super(new StructDefType());
        symTab = table;
    }

    public SymTable getSymTable() {
        return symTab;
    }
}
