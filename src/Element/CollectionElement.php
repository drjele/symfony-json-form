<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\SymfonyJsonForm\Element;

use Drjele\SymfonyJsonForm\Traits\ElementCollectionTrait;

final class CollectionElement extends AbstractElement
{
    use ElementCollectionTrait;

    protected function getType(): string
    {
        return 'collection';
    }

    public function render($data): array
    {
        /** @todo refactor for collections with prototype */
        $elements = [];

        foreach ($this->elements as $element) {
            $elements[] = $element->render($data[$element->getName()] ?? null);
        }

        return $this->renderBase() + [
            'elements' => $elements,
        ];
    }
}
