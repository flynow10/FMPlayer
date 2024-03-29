import { FunctionBuilder } from "@/src/music/functions/core/function-builder";
import { createEmpty } from "@/src/music/functions/utils/create-empty";
import { validateFunction } from "@/src/music/functions/validation/validate-function";

// Tests generated by github copilot
// Tweaked by Flynow10
describe("FunctionBuilder", () => {
  let functionBuilder: FunctionBuilder;

  beforeEach(() => {
    functionBuilder = new FunctionBuilder();
  });

  it("should add a play action", () => {
    const trackId = "testTrackId";
    functionBuilder.addPlayAction(trackId);

    const tree = functionBuilder.getTree();
    expect(tree).toHaveLength(1);
    expect(tree[0]).toEqual(
      expect.objectContaining({
        type: "play",
        group: "actions",
        trackExpressions: expect.arrayContaining([
          expect.objectContaining({
            type: "trackliteral",
            group: "tracks",
            data: expect.objectContaining({ trackId }),
          }),
        ]),
      })
    );
  });

  it("should add a loop action", () => {
    const count = { ...createEmpty.numberliteral(), data: { value: 3 } };
    functionBuilder.addLoop(count);

    const tree = functionBuilder.getTree();
    expect(tree).toHaveLength(1);
    expect(tree[0]).toEqual(
      expect.objectContaining({
        numberExpressions: expect.arrayContaining([count]),
      })
    );
  });

  it("should add tracks inside of loop actions", () => {
    const trackId = "testTrackId";
    const count = { ...createEmpty.numberliteral(), data: { value: 3 } };
    functionBuilder.addLoop(count);
    functionBuilder.addPlayAction(trackId);
    functionBuilder.exitLoop();
    const tree = functionBuilder.getTree();
    expect(tree).toHaveLength(1);
    expect(tree[0].childNodes)
      .toHaveLength(1)
      .toEqual([
        expect.objectContaining({
          trackExpressions: [
            expect.objectContaining({
              data: expect.objectContaining({ trackId }),
            }),
          ],
        }),
      ]);
  });

  it("should build the function tree", () => {
    const trackId = "testTrackId";
    functionBuilder.addPlayAction(trackId);

    const tree = functionBuilder.build();
    expect(validateFunction(tree)).toBeTrue();
  });

  it("should throw an error when building an invalid function tree", () => {
    functionBuilder.addLoop({
      ...createEmpty.numberliteral(),
      data: { value: 3 },
    });
    functionBuilder.exitLoop();

    expect(() => functionBuilder.build()).toThrow();
  });

  it("should create a number expression", () => {
    const expression = FunctionBuilder.createNumberExpression("1 + 2 * 3");

    expect(expression).toEqual(
      expect.objectContaining({
        numberExpressions: [
          expect.objectContaining({
            data: expect.objectContaining({ value: 1 }),
          }),
          expect.objectContaining({
            numberExpressions: [
              expect.objectContaining({ data: { value: 2 } }),
              expect.objectContaining({ data: { value: 3 } }),
            ],
            data: expect.objectContaining({ operator: "*" }),
          }),
        ],
        data: expect.objectContaining({ operator: "+" }),
      })
    );
  });
});
