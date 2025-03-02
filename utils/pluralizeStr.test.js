import { pluralizeStr, singularizeStr } from './utils/pluralizeStr';

describe('pluralizeStr', () => {
    test('should pluralize regular words', () => {
        expect(pluralizeStr('cat')).toBe('cats');
        expect(pluralizeStr('bus')).toBe('buses');
        expect(pluralizeStr('baby')).toBe('babies');
        expect(pluralizeStr('leaf')).toBe('leaves');
    });

    test('should pluralize irregular words', () => {
        expect(pluralizeStr('child')).toBe('children');
        expect(pluralizeStr('goose')).toBe('geese');
        expect(pluralizeStr('man')).toBe('men');
        expect(pluralizeStr('mouse')).toBe('mice');
    });

    test('should pluralize words with custom irregulars', () => {
        const irregulars = { mouse: 'mice', person: 'people' };
        expect(pluralizeStr('mouse', irregulars)).toBe('mice');
        expect(pluralizeStr('person', irregulars)).toBe('people');
    });
});

describe('singularizeStr', () => {
    test('should singularize regular words', () => {
        expect(singularizeStr('cats')).toBe('cat');
        expect(singularizeStr('buses')).toBe('bus');
        expect(singularizeStr('babies')).toBe('baby');
        expect(singularizeStr('leaves')).toBe('leaf');
    });

    test('should singularize irregular words', () => {
        expect(singularizeStr('children')).toBe('child');
        expect(singularizeStr('geese')).toBe('goose');
        expect(singularizeStr('men')).toBe('man');
        expect(singularizeStr('mice')).toBe('mouse');
    });

    test('should singularize words with custom irregulars', () => {
        const irregulars = { mice: 'mouse', people: 'person' };
        expect(singularizeStr('mice', irregulars)).toBe('mouse');
        expect(singularizeStr('people', irregulars)).toBe('person');
    });
});

