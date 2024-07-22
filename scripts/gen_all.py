import ast
import sys


def gen_all_exp(content):
    node = ast.parse(content)
    names = set()
    for n in node.body:
        if isinstance(n, (ast.FunctionDef, ast.ClassDef, ast.AsyncFunctionDef)):
            if n.name.startswith('_'):
                continue
            names.add(n.name)
        if isinstance(n, ast.Assign):
            for target in n.targets:
                if isinstance(target, ast.Name) and not target.id.startswith('_'):
                    names.add(target.id)

    names = sorted(names)
    length = sum(len(n) for n in names)
    if length > 78:
        all_exp = '__all__ = [\n    ' + '\n    '.join([f"'{n}'," for n in names]) + '\n]'
    else:
        all_exp = '__all__ = ['
        for i, n in enumerate(names):
            if i == len(names) - 1:
                all_exp += f"'{n}'"
            else:
                all_exp += f"'{n}', "
        all_exp += ']'

    return all_exp


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python gen_all.py <file>')
        exit(1)
    path_or_content = sys.argv[1]
    if path_or_content.startswith('/'):
        with open(path_or_content, 'r') as f:
            content = f.read()
        print(gen_all_exp(content))
    else:
        print(gen_all_exp(path_or_content))
