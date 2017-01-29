
var assert = require('chai').assert;
var path = require('path');
var sassGraph = require('..');
var fixture = require('./util').fixture;
var graph = require('./util').graph;

describe('sass-graph', function(){
  describe('parseFile', function () {
    describe('with a simple graph', function() {
      it('should return a graph', function() {
        graph().fromFixtureFile('simple')
          .assertDecendents([
            'b.scss',
            '_c.scss',
            path.join('nested', '_d.scss'),
            path.join('nested', '_e.scss'),
          ])
          .assertAncestors(path.join('nested', '_e.scss'), [
            path.join('nested', '_d.scss'),
            '_c.scss',
            'b.scss',
            'index.scss',
          ])
          .assertAncestors(path.join('nested', '_d.scss'), [
            '_c.scss',
            'b.scss',
            'index.scss',
          ])
          .assertAncestors('_c.scss', [
            'b.scss',
            'index.scss',
          ])
          .assertAncestors('b.scss', [
            'index.scss',
          ])
          .assertAncestors('index.scss', []);
      });
    });

    describe('with a graph with loadPaths', function() {
      it.skip('should return a graph', function() {
        var includeFolder = 'inside-load-path';
        var excludeFolder = 'outside-load-path';
        var opts = { loadPaths: [ fixture('load-path')(includeFolder) ] };

        graph(opts).fromFixtureFile('load-path')
          .assertDecendents([
            path.join(includeFolder, '_b.scss'),
            path.join(includeFolder, '_c.scss'),
            '_d.scss',
          ])
          .assertAncestors(path.join('_d.scss'), [
            path.join(includeFolder, '_c.scss'),
            path.join(includeFolder, '_b.scss'),
            'index.scss',
          ])
          .assertAncestors(path.join(includeFolder, '_c.scss'), [
            path.join(includeFolder, '_b.scss'),
            'index.scss',
          ])
          .assertAncestors(path.join(includeFolder, '_b.scss'), [
            'index.scss',
          ])
          .assertAncestors('index.scss', [])
          .assertAncestors(path.join(excludeFolder, '_b.scss'), [])
          .assertAncestors(path.join(excludeFolder, '_c.scss'), []);
      });

      it('should prioritize cwd', function() {
        var includeFolder = 'inside-load-path';
        var excludeFolder = 'outside-load-path';
        var opts = { loadPaths: [ fixture('load-path-cwd')(includeFolder) ] };

        graph(opts).fromFixtureFile('load-path-cwd').assertDecendents([
          '_b.scss',
          path.join(includeFolder, '_c.scss'),
        ])
        .assertAncestors(path.join(includeFolder, '_c.scss'), [
          '_b.scss',
          'index.scss',
        ])
        .assertAncestors('_b.scss', [
          'index.scss',
        ])
        .assertAncestors('index.scss', [])
        .assertAncestors(path.join(includeFolder, '_b.scss'), [])
        .assertAncestors(path.join(excludeFolder, '_b.scss'), [])
        .assertAncestors(path.join(excludeFolder, '_c.scss'), []);
      });
    });

    describe('with a folder that has an extension', function() {
      it('should return a graph', function () {
        var leaf = path.join('_nested.scss', '_leaf.scss');
        graph().fromFixtureFile('folder-with-extension')
          .assertDecendents([leaf])
          .assertAncestors(leaf, ['index.scss']);
      });
    });

    describe('with no imports', function() {
      it('should return a graph', function () {
        graph().fromFixtureFile('no-imports').assertDecendents([]);
      });
    });

    describe('when the file is inaccessible', function() {
      it('should thow an error', function () {
        assert.throws(function() {
          graph().fromFixtureFile('no-such-path');
        });
      });
    });

    describe('with options', function() {
      it('should not use inherited propterties', function() {
        before(function() {
          Array.prototype.foo = function() {};
        });

        after(function() {
          delete Array.prototype.foo;
        });

        assert.doesNotThrow(function() {
          graph().fromFixtureFile('no-imports').assertDecendents([]);
        });
      });
    });
  });
});
